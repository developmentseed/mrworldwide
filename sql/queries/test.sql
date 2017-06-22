SELECT SUM(num_changes) as num_changes, user
FROM {{DATABASE}}.changesets
WHERE regexp_like(tags['comment'], '(?i)#missingmaps')
GROUP BY user
ORDER BY num_changes DESC;
