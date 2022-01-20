# What is this?

The Paradox Launcher wasn't syncing my HOI 4 playsets automatically, and I noticed the import/export playset
button. But it required me to export one at a time which was annoying.

The launcher stores these configs in an SQLite DB, so I wrote a small tool to

* Connect to the local SQLite DB
* Retrieve all the playSets
* Display all playSets, choose the ones to export or export all of them if none are selected
* Export valid configs to `%APPDIR%/output/%PLAYSET_NAME%.json`

These configs can them be imported via the Paradox Launcher.

The tool should auto-detect the launcher-v2.sqlite file based on your OS. But if it can't find the file
it'll prompt you for it.

The launcher-v2.sqlite file can be found in the Paradox Interactive folder detailed [here](https://www.pcgamingwiki.com/wiki/Hearts_of_Iron_IV#Configuration_file.28s.29_location).

### Notes

Right now this is hard-coded for HOI 4 since I don't really play other Paradox games. I might
take a look at it in the future. Or you're welcome to create a PR.

I'll probably add another mode to this that dumps all the data necessary to just insert all the playsets
directly into the other devices launcher-v2.sqlite. Instead of using the import function in the Launcher.

# How To Use

I took this opportunity to test out [nx](https://nx.dev/). 100% overkill for a tiny tool, but it was a smaller environment
to get familiar with it.

* Make sure pnpm is installed globally by running `npm i -g pnpm`
* Run `pnpm i`
* Run `nx run paradox-launcher-playset-manager:serve`

Enjoy!
