## Source Code Reference

Source code for dependencies is cached at `~/.opensrc/`.

Use `opensrc path` inside other commands to read source:

```bash
rg "pattern" $(opensrc path <npm:package>)
cat $(opensrc path <npm:package>)/path/to/file

rg "pattern" $(opensrc path <github:owner>/<repo>)
cat $(opensrc path <github:owner/repo>)/path/to/file
```

For referencing
`https://github.com/aidenybai/cnfast/`


```bash
rg "pattern" $(opensrc path aidenybai/cnfast)
cat $(opensrc path aidenybai/cnfast)/path/to/file
```
