# Elasticms publisher

NPM package for publishing through [elasticms](https://www.elasticms.eu) API.

## Installation

```bash
npm install @elasticms/publisher
```

## Usage

### ems-zip-create

```bash
npx ems-zip-create --help

Usage: ems-zip-create

Options:
  --filename  Filename zip                     [string] [default: "publish.zip"]
  --globs     glob patterns)                           [array] [default: ["**"]]
```

#### examples

create a zip named publish.zip with all files
```bash
npx ems-zip-create
```

create a zip named example.zip with all html files
```bash
npx ems-zip-create --filename example.zip --globs *.html
```

create a zip named example.zip with all files except html files
```bash
npx ems-zip-create --filename example.zip --globs ** '!*.html'
```

create a zip with all files in the directory named assets
```bash
npx ems-zip-create --filename example.zip --globs assets/** 
```

### ems-zip-publish

**IMPORTANT**: for using this command you need to define 2 environment variables named **EMS_URL** and **EMS_TOKEN**.

```bash
npx ems-zip-publish

Usage: ems-zip-publish

Commands:
  zip-publish.js ems-publish [emsId]  emsId (contentType:ouuid)

Options:
  --filename  Filename zip                     [string] [default: "publish.zip"]
  --field     Field name                          [string] [default: "zip_file"]
```

#### examples

Upload the zip named example.zip and create/finalize a new revision for the page with ouuid (AWAST5ok8KzLLWaPKqlr)
```bash
npx ems-zip-publish page:AWAST5ok8KzLLWaPKqlr --filename example.zip --field example_zip
```
