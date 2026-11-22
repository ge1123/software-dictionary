"""Check every rendered ER diagram against the database catalog used for that chapter."""
from collections import Counter
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[2]
atlas = root / "src/model-atlas"
site = Path(sys.argv[1]) if len(sys.argv) == 2 else root / "dist"
chapters = json.loads((atlas / "index.json").read_text())["chapters"]
index = (site / "models/index.html").read_text()
count = 0
ns = {"svg": "http://www.w3.org/2000/svg"}
for chapter in chapters:
    slug = chapter["slug"]
    assert f'href="./{slug}/"' in index, slug
    data = json.loads((atlas / "chapters" / f"{slug}.json").read_text())
    objects = {t["schema"] + "." + t["name"]: t for t in data["tables"]}
    html = (site / "models" / slug / "index.html").read_text()
    diagrams = re.findall(r'<svg\s.*?</svg>', html, re.S)
    assert len(diagrams) == len(data["plans"]), slug
    for plan, diagram in zip(data["plans"], diagrams):
        svg = ET.fromstring(diagram)
        tag = (slug, plan["code"])
        assert svg.get("role") == "img" and plan["title"] in svg.get("aria-label"), tag
        assert f'id="{plan["code"].lower()}"' in html, tag
        nodes = {
            g.findtext("svg:title", namespaces=ns): [x.text for x in g.findall("svg:text", ns)]
            for g in svg.findall(".//svg:g[@class='node']", ns)
        }
        edges = Counter(
            (g.findtext("svg:title", namespaces=ns), tuple(x.text for x in g.findall("svg:text", ns)))
            for g in svg.findall(".//svg:g[@class='edge']", ns)
        )
        wanted = Counter()
        if "concept" in plan:
            conceptual = plan["concept"]
            assert set(nodes) == set(conceptual["entities"]), tag
            for name, fields in conceptual["entities"].items():
                assert all(field in nodes[name] for field in fields), tag
            for a, b, label in conceptual["links"]:
                wanted[(a + "->" + b, (label,))] += 1
        else:
            assert set(nodes) == set(plan["tables"]), tag
            for name in plan["tables"]:
                t = objects[name]
                cols = []
                for col, dtype, _ in t["columns"]:
                    flags = [flag for kind, flag in [('p', 'PK'), ('f', 'FK')]
                             if any(k["type"] == kind and col in k["cols"] for k in t["constraints"])]
                    cols.extend([col, " · ".join([dtype, *flags])])
                assert nodes[name][1:] == cols, (tag, name)
                for k in t["constraints"]:
                    if k["type"] == "f":
                        end = k["targetSchema"] + "." + k["target"]
                        pairs = [f"{a} → {b}" for a, b in zip(k["cols"], k["refs"], strict=True)]
                        required = all(next(col[2] for col in t["columns"] if col[0] == src) for src in k["cols"])
                        unique = any(con["type"] in ("p", "u") and set(con["cols"]) <= set(k["cols"]) for con in t["constraints"])
                        cardinality = ("0..1" if unique else "0..N") + " → " + ("1" if required else "0..1")
                        wanted[(name + "->" + end, (*pairs, cardinality))] += 1
                for d in t.get("depends", []):
                    wanted[(name + "->" + d["schema"] + "." + d["name"], ("reads",))] += 1
        assert edges == wanted, (tag, edges - wanted, wanted - edges)
        count += 1
print(f"Verified {len(chapters)} linked chapter pages and {count} rendered ER diagrams.")

# The standalone lesson shows a projection of the same lab. Inspect the assets
# referenced by the built page, including SVGs that Vite inlines as data URLs.
from base64 import b64decode
from html.parser import HTMLParser
from urllib.parse import unquote_to_bytes

class CaseImages(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag == "img":
            self.sources.append(dict(attrs)["src"])

case = site / "cases/split-shipments"
images = CaseImages()
images.feed((case / "index.html").read_text())
assert len(images.sources) == 2, "split shipments A and B"
projections = []
for source in images.sources:
    if source.startswith("data:image/svg+xml"):
        meta, payload = source.split(",", 1)
        raw = b64decode(payload) if ";base64" in meta else unquote_to_bytes(payload)
    else:
        raw = (case / source).read_bytes()
    projections.append(ET.fromstring(raw))

laboratory = json.loads((atlas / "chapters/core-06-split-shipments.json").read_text())["tables"]
summary, detail = projections
order_line = next(t for t in laboratory if t["schema"] == "lab06_a" and t["name"] == "order_line")
assert summary.findtext("svg:text", namespaces=ns) == order_line["name"]
primary = next(k["cols"] for k in order_line["constraints"] if k["type"] == "p")
expected_rows = []
for name, dtype, _ in order_line["columns"]:
    expected_rows += [name, {"integer": "int"}.get(dtype, dtype) + (" · PK" if name in primary else "")]
assert [t.text for t in summary.findall(".//svg:g/svg:text", ns)] == expected_rows

core = {t["name"]: t for t in laboratory if t["schema"] == "lab06_b" and
        t["name"] in {"orders", "order_line", "shipment", "shipment_item"}}
seen = set()
for group in detail.findall("svg:g", ns):
    title = group.findtext("svg:text[@class='heading']", namespaces=ns)
    if title is None:
        continue
    assert title not in seen and title in core, title
    seen.add(title)
    table = core[title]
    keys = {key.get("y"): key.text for key in group.findall("svg:text[@class='key']", ns)}
    for field in group.findall("svg:text[@class='field']", ns):
        for name in field.text.split(", "):
            assert name in [c[0] for c in table["columns"]], (title, name)
            flags = [flag for kind, flag in [("p", "PK"), ("f", "FK"), ("u", "UNIQUE")]
                     if any(k["type"] == kind and name in k["cols"] and
                            (kind != "u" or k["cols"] == [name]) for k in table["constraints"])]
            assert keys.get(field.get("y"), "") == " / ".join(flags), (title, name)
assert seen == set(core)
expected_edges = Counter()
for child, t in core.items():
    for fk in (k for k in t["constraints"] if k["type"] == "f" and k["target"] in core):
        required = all(next(c[2] for c in t["columns"] if c[0] == col) for col in fk["cols"])
        unique = any(k["type"] in ("u", "p") and set(k["cols"]) <= set(fk["cols"]) for k in t["constraints"])
        expected_edges[(fk["target"], child, "1" if required else "0..1", "0..1" if unique else "0..N")] += 1
actual_edges = Counter((g.get("data-parent"), g.get("data-child"), *(t.text for t in g.findall("svg:text", ns)))
                       for g in detail.findall("svg:g[@data-parent]", ns))
assert actual_edges == expected_edges, "split shipment core relationships"
print("Verified both standalone split shipment diagrams against their lab.")
