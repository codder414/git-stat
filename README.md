# git-stat

Simple utility that will show you some useful statistics about your project like:
 - Author
 - Commit name
 - Number of Changed files
 - Commit Hash
 - last modified

# Install

```bash
$ git clone https://github.com/codder414/git-stat.git
$ cd git-stat
$ npm i && npm run build #build project
$ npm install -g .
```


# Usage

```bash
$ # cd to .git project
$ git-stat

/home/user/project/.git
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┬─────────────┬──────────┬────────────────────┐
│ Author                                           │ Commit                                           │ Changed Fi… │ hash     │ date               │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ john@gmail.com                                   │ fix: -f command repair                           │ 5           │ 25bb000  │ 4 minutes ago"     │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ john@gmail.com                                   │ fix: import error                                │ 3           │ 7e5845a  │ 57 minutes ago"    │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ john@gmail.com                                   │ refactor: update deps                            │ 8           │ 124a8b3  │ 62 minutes ago"    │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ john@gmail.com                                   │ refactor: update                                 │ 8           │ 96d0f35  │ 75 minutes ago"    │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ john@gmail.com                                   │ refactor: cleanup and update                     │ 7           │ 75484cd  │ 2 hours ago"       │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ kelly@sidenis.com                                │ secure: fix security vuln                        │ 3           │ 5ac16e8  │ 11 months ago"     │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ kelly@sidenis.com                                │ refactor: update name                            │ 3           │ f4279a1  │ 11 months ago"     │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┼─────────────┼──────────┼────────────────────┤
│ kelly@sidenis.com                                │ feat: initial                                    │ 9           │ 0c490d8  │ 11 months ago"     │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┴─────────────┴──────────┴────────────────────┘
```

# Help
```bash
Options:
      --help        Show help                                          [boolean]
      --version     Show version number                                [boolean]
  -i, --input                                                          [string]
  -p, --plain   # tabulated view                                       [boolean]
  -j, --json    # output as json to stdout                             [boolean]
  -f, --for-commit # show data only for one commit                     [string]
```

```
please be carefuly if you use it in production. Utility tested only in linux env.
```
