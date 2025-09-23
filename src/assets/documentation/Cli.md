# FHDportal CLI

A command-line interface tool for working with FHDportal submission bundles and metadata validation. FHDportal is a submission platform for the Federated European Genome-phenome Archive (FEGA), developed by the SIB Swiss Institute of Bioinformatics.

## Binary Distribution

For easier deployment and usage, the FHDportal CLI available as pre-built binaries.

### Download Binaries

Download the appropriate binary for your platform using **Dowload CLI Tool** button at the top of the page.

- **Linux (x64)**: `fega-linux`
- **macOS (Intel)**: `fega-macos-x64`
- **macOS (Apple Silicon)**: `fega-macos-arm`
- **Windows (x64)**: `fega-windows.exe`


### Installation

1. **Make executable** (Linux/macOS):

```bash
chmod +x fega-linux  # or fega-macos-arm
```

2. **MacOS** security:

Recent version of macOS prevents the execution of this unsigned binary. To overcome this limitation run the following command:

```bash
xattr -dr com.apple.quarantine fega-macox-x64    # Intel Mac
xattr -dr com.apple.quarantine fega-macox-arm    # Apple Silicon Mac
```



2. **Rename for convenience** (optional):

```bash
# Linux
mv fega-linux fega

# macOS (choose the right one for your system)
mv fega-macos-x64 fega    # Intel Mac
mv fega-macos-arm fega    # Apple Silicon Mac

# Windows
mv fega-windows.exe fega.exe
```

3. **Add to PATH** (optional):

```bash
# Linux/macOS - move to /usr/local/bin or add directory to PATH
sudo mv fega /usr/local/bin/

# Windows - move to a directory in your PATH or add directory to PATH
```



### Usage with Binaries

Once installed, use the binary just like the PHP version:

```bash
# Using renamed binary
fega --help
fega validate my-genomic-study/
fega update
fega template -o templates.zip

# Using full binary name
./fega-linux validate my-genomic-study/
./fega-macos-x64 update        # Intel Mac
./fega-macos-arm update        # Apple Silicon Mac
./fega-windows.exe template -o templates.zip
```

## Example dataset

A mimimal submission dataset can be downloaded from [https://fega-portal-dev.vital-it.ch/fega-test-submission.zip](https://fega-portal-dev.vital-it.ch/fega-test-submission.zip).

## Usage

The FHDportal CLI provides five main commands for working with FHDportal submission bundles:

```bash
fega <command> [options] [arguments]
```

### Available Commands

- [`update`](#update-command) - Update local JSON schemas
- [`document`](#document-command) - Generate Markdown documentation for resource schemas
- [`template`](#template-command) - Generate TSV file templates for metadata
- [`bundle`](#bundle-command) - Generate a manifest file for a submission bundle
- [`validate`](#validate-command) - Validate metadata files and submission bundles

## Quick Start Guide

This guide will walk you through creating your first submission bundle from start to finish.

### Step 1: Update JSON Schemas

First, ensure you have the latest validation schemas:

```bash
fega update -v
```

This downloads the current schema definitions from FHDportal and saves them to `config/schemas/`.

### Step 2: Generate File Templates

Create template files to help structure your metadata:

```bash
fega template -o my-genomic-study.zip -v
```

Extract the templates to your working directory:

```bash
unzip my-genomic-study.zip
```

You will now have template files like:

- `studies.tsv`
- `samples.tsv`
- `molecular_experiments.tsv`
- `molecular_runs.tsv`
- `molecular_analyses.tsv`
- `datasets.tsv`

### Step 3: Add Your Data

Edit the TSV files with your metadata. For example, in `studies.tsv`:

```tsv
title	description	type
My Genomic Study	A comprehensive genomic analysis	Cancer Genomics
```

### Step 4: Create a Submission Bundle

Generate a manifest file and optionally create an archive:

```bash
fega bundle -a -o my-genomic-study.zip -v .
```

This creates:

- `manifest.yaml` - Maps your files to FHDportal resource types
- `my-genomic-study.zip` - Complete submission archive

### Step 5: Validate Your Bundle

Check that your submission bundle is valid:

```bash
fega validate -v my-submission-bundle.zip
```

If validation passes, you'll see:

```
[OK] All resources validated successfully
```

If there are errors, fix them and run the validation again until successful.

### Complete Example Workflow

Here is the full sequence of commands:

```bash
# 1. Update schemas
fega update

# 2. Set up your project
mkdir my-genomic-study
cd my-genomic-study

# 3. Generate templates
fega template -o templates.zip
unzip templates.zip
rm templates.zip

# 4. Edit your TSV files with metadata
# (Populate the data programmatically or use your preferred spreadsheet application)

# 5. Create the bundle
fega bundle -a -o my-genomic-study.zip .

# 6. Validate before submission
fega validate my-genomic-study.zip
```

## Commands

### Bundle Command

Generate a manifest file for an FHDportal submission bundle.

#### Syntax

```bash
fega bundle [options] <directory-path>
```

#### Arguments

- `directory-path` **(required)** - Directory containing files to bundle

#### Options

- `-a, --create-archive` - Create a ZIP archive of the bundle
- `-o, --output-file=OUTPUT-FILE` - Output file path for the archive
- `-w, --overwrite-manifest` - Overwrite manifest file if it already exists
- `-v, --verbose` - Increase verbosity of messages
- `-h, --help` - Display help for the command

#### Description

The `bundle` command scans a directory containing metadata files and generates a `manifest.yaml` file that describes the contents of the submission bundle. The manifest maps each file to its corresponding resource type based on the filename.

**Supported resource types:**

- `Study` (studies.tsv)
- `Sample` (samples.tsv)
- `MolecularExperiment` (molecular_experiments.tsv)
- `MolecularRun` (molecular_runs.tsv)
- `MolecularAnalysis` (molecular_analyses.tsv)
- `Dataset` (datasets.tsv)

#### Examples

**Basic usage:**

```bash
fega bundle /path/to/submission/data
```

**Create a bundle with archive:**

```bash
fega bundle -a /path/to/submission/data
```

**Specify custom archive name:**

```bash
fega bundle -a -o my-submission.zip /path/to/submission/data
```

**Overwrite existing manifest:**

```bash
fega bundle -w /path/to/submission/data
```

**Verbose output:**

```bash
fega bundle -v -a /path/to/submission/data
```

---

### Document Command

Generate documentation for resource schemas in Markdown or HTML format.

#### Syntax

```bash
fega document [options]
```

#### Options

- `-o, --output-file=OUTPUT-FILE` - Output file path for the documentation
- `-f, --output-format=OUTPUT-FORMAT` - Output format: `md` or `html` (default: `md`)
- `-v, --verbose` - Increase verbosity of messages
- `-h, --help` - Display help for the command

#### Description

The `document` command generates comprehensive documentation for all available FHDportal resource schemas. This documentation includes detailed information about each resource type, including field descriptions, data types, constraints, and valid values.

**Supported formats:**

- **Markdown (`md`)** - Default format, suitable for documentation repositories and README files
- **HTML (`html`)** - Web-ready format with professional styling, suitable for hosting and sharing

#### Examples

**Generate Markdown documentation with default filename:**

```bash
fega document
```

**Generate HTML documentation:**

```bash
fega document -f html
```

**Specify custom output file:**

```bash
fega document -o resource_schemas.md
```

**Generate HTML with custom filename:**

```bash
fega document -f html -o docs.html
```

**Verbose output:**

```bash
fega document -v
```

---

### Template Command

Generate TSV file templates for metadata submission.

#### Syntax

```bash
fega template [options]
```

#### Options

- `-o, --output-file=OUTPUT-FILE` - Output file path for the archive (default: `templates.zip`)
- `-v, --verbose` - Increase verbosity of messages
- `-h, --help` - Display help for the command

#### Description

The `template` command generates TSV (Tab-Separated Values) file templates for all available FHDportal resource types. These templates contain the correct column headers based on the current JSON schemas, making it easier to prepare metadata files for submission.

The templates are created based on the table schemas retrieved from the local JSON schema files. Each template file is named using the pluralized, snake_case version of the resource type (e.g., `molecular_analyses.tsv` for `MolecularAnalysis`).

#### Examples

**Generate templates with default filename:**

```bash
fega template
```

**Specify custom output file:**

```bash
fega template -o my-templates.zip
```

**Verbose output:**

```bash
fega template -v
```

---

### Update Command

Update the local JSON schemas.

#### Syntax

```bash
fega update [options]
```

#### Options

- `-v, --verbose` - Increase verbosity of messages
- `-h, --help` - Display help for the command

#### Description

The `update` command fetches the latest JSON schemas from the FHDportal and updates the local schema files in the `config/schemas/` directory. This ensures that validation and template generation use the most current schema definitions.

The command performs the following operations:

1. Fetches schemas from the FHDportal API endpoint
2. Deletes existing local schema files
3. Creates new schema files with the updated definitions
4. Formats the JSON content for readability

#### Examples

**Update schemas:**

```bash
fega update
```

**Update with verbose output:**

```bash
fega update -v
```

---

### Validate Command

Validate metadata files and submission bundles.

#### Syntax

```bash
fega validate [options] <target-path>
```

#### Arguments

- `target-path` **(required)** - File or directory path to validate

#### Options

- `-t, --resource-type=RESOURCE-TYPE` - Type of the resource (default: `SubmissionBundle`)
- `-f, --output-format=OUTPUT-FORMAT` - Output format: `json` or `text` (default: `text`)
- `-v, --verbose` - Increase verbosity of messages
- `-h, --help` - Display help for the command

#### Description

The `validate` command performs comprehensive validation of FHDportal metadata files and submission bundles against the JSON schemas. It supports various input formats and provides detailed error reporting.

**Supported input types:**

- **Directories** - Validates as submission bundles
- **ZIP archives** - Extracts and validates as submission bundles
- **TSV/CSV files** - Validates individual metadata files
- **JSON files** - Validates individual resource files

**Validation features:**

- Schema validation against FHDportal JSON schemas
- Manifest file validation
- Cross-referential integrity checks
- Detailed error reporting with line numbers
- Error grouping for similar issues

#### Examples

**Validate a submission bundle directory:**

```bash
fega validate /path/to/submission/bundle
```

**Validate a ZIP archive:**

```bash
fega validate submission-bundle.zip
```

**Validate a TSV file with specific resource type:**

```bash
fega validate -t Dataset datasets.tsv
```

**Validate with JSON output:**

```bash
fega validate -f json /path/to/bundle
```

**Validate with verbose output:**

```bash
fega validate -v /path/to/bundle
```

#### Resource Types

The following resource types are supported for validation:

- `SubmissionBundle` (default)
- `Study`
- `Sample`
- `MolecularExperiment`
- `MolecularRun`
- `MolecularAnalysis`
- `Dataset`

#### Output Formats

**Text Format (default):**

- Human-readable output with color coding
- Grouped error reporting
- Line number references
- Success/failure summaries

**JSON Format:**

- Machine-readable structured output
- Complete validation results
- Suitable for integration with other tools

---

## Github repository

https://github.com/sib-swiss/fhdportal-cli