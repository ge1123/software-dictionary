SELECT ns.nspname AS schema, obj.relname AS name, obj.relkind AS kind,
       ARRAY(
         SELECT json_build_array(a.attname, format_type(a.atttypid, a.atttypmod), a.attnotnull)
         FROM pg_attribute a
         WHERE a.attrelid = obj.oid AND a.attnum > 0 AND NOT a.attisdropped
         ORDER BY a.attnum
       ) AS columns,
       ARRAY(
         SELECT json_build_object(
             'type', con.contype, 'sql', pg_get_constraintdef(con.oid),
             'cols', ARRAY(SELECT a.attname FROM unnest(con.conkey) WITH ORDINALITY key(attnum, pos)
                  JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = key.attnum ORDER BY key.pos),
             'target', target.relname, 'targetSchema', target_ns.nspname,
             'refs', ARRAY(SELECT a.attname FROM unnest(con.confkey) WITH ORDINALITY key(attnum, pos)
                  JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = key.attnum ORDER BY key.pos))
         FROM pg_constraint con
         LEFT JOIN pg_class target ON target.oid = con.confrelid
         LEFT JOIN pg_namespace target_ns ON target_ns.oid = target.relnamespace
         WHERE con.conrelid = obj.oid AND con.contype IN ('p','f','u','c','x')
         ORDER BY con.conname
       ) AS constraints,
       ARRAY(
         SELECT pg_get_indexdef(i.indexrelid) FROM pg_index i
         WHERE i.indrelid = obj.oid AND i.indisunique
         ORDER BY i.indexrelid
       ) AS indexes,
       ARRAY(
         SELECT DISTINCT n.nspname || '.' || r.relname
         FROM pg_rewrite w
         JOIN pg_depend d ON d.classid = 'pg_rewrite'::regclass AND d.objid = w.oid
           AND d.refclassid = 'pg_class'::regclass
         JOIN pg_class r ON r.oid = d.refobjid
         JOIN pg_namespace n ON n.oid = r.relnamespace
         WHERE w.ev_class = obj.oid AND r.oid <> obj.oid AND n.nspname = ANY($1)
         ORDER BY 1
       ) AS dependencies
FROM pg_class obj
JOIN pg_namespace ns ON ns.oid = obj.relnamespace
WHERE ns.nspname = ANY($1) AND obj.relkind IN ('r','p','v','m')
ORDER BY ns.nspname, obj.relname;
