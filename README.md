# A Diary Generator

Reads diaries written in markdown from a git submodule, and generates a static site for it. ([Demo](http://joyeecheung.github.io/diary/))

## About the repos

The markdown files for the diaries can be kept under another repo named `YYYY/MM/DDDD.md`([Example](https://github.com/joyeecheung/my-tech-diary)).

## Build

1. Run `npm install` to install the dependencies
2. Configure `config.js` and `.gitsubmodules`
3. Run
  1. `git submodule sync` to update the remote url
  2. `git submodule init` to setup your submodule
  2. `git submodule update` to update your submodule
  3. `git submodule -q foreach git pull` to pull the markdown files
4. Run `gulp build` to generate the static site (placed under `dist`).
5. Run `gulp server` and visit `http://localhost:8000/diary` if you want to see it hosted locally(make sure the port 8000 is not taken).

## Deploy to GitHub Pages

1. Set up the SSH git remote `origin` for the project.
2. After building the web page, run `gulp deploy`.
3. Everything under dist will be pushed to the remote repo's gh-pages branch.

## Develop

1. Make sure port 35729(for livereload) and 8000(for the local server) are available.
2. Run gulp, then visit http://localhost:8000/diary`.
3. Start development!

## TODO

- [ ] Write a calendar to replace pikaday
- [ ] Add "previous" and "next" button to the diary pages

## LICENSE

(MIT License)

Copyright (c) 2015 Joyee Cheung

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.