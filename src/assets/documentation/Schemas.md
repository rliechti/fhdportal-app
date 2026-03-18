# FHDportal Schema Documentation
---
## datasets.tsv

Resource Type: `Dataset`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>title</u> | string |  | yes | unique |  |
| description | string |  | yes |  |  |
| dataset_types | array[string] |  | yes | unique items | comma-separated values |
| runs | string |  | no |  |  |
| analyses | string |  | no |  |  |
| released_date | string |  | yes |  |  |

## image_analyses.tsv

Resource Type: `ImageAnalysis`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| files | array[string] | List of associated file public ids | yes | unique items | comma-separated values |
| <u>title</u> | string | Title of the analysis | yes | unique |  |
| analysis_method_and_details | string | Analysis method | yes |  |  |
| description | string | Description of the analysis | yes |  |  |
| analysis_result_type | string | Numerical analyses, segmention (non-image), categorical features/phenotypes | yes |  |  |
| samples | string |  | no |  |  |
| experiments | string |  | no |  |  |

## image_experiments.tsv

Resource Type: `ImageExperiment`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>title</u> | string | The experiment alias | yes | unique |  |
| preparation_method | string | Sample preparation protocol | yes |  |  |

## image_runs.tsv

Resource Type: `ImageRun`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>title</u> | string | Title of the Run | yes | unique |  |
| experiment | string |  | no |  |  |
| sample | string |  | no |  |  |
| files | array[string] | List of associated file public ids | yes | unique items | comma-separated values |
| file_type | string |  | yes |  |  |

## molecular_analyses.tsv

Resource Type: `MolecularAnalysis`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| files | array[string] | List of associated file public ids | yes | unique items | comma-separated values |
| <u>title</u> | string | Title of the analysis | yes | unique |  |
| platform | string | Name of the analysis platform | yes |  |  |
| genome_id | string | Genome version used in the analysis | yes | one of | • `GRCh37.p10: GCA_000001405.11`<br>• `GRCh37.p11: GCA_000001405.12`<br>• `GRCh37.p12: GCA_000001405.13`<br>• `GRCh37.p13: GCA_000001405.14`<br>• `GRCh37.p1: GCA_000001405.2`<br>• `GRCh37.p2: GCA_000001405.3`<br>• `GRCh37.p3: GCA_000001405.4`<br>• `GRCh37.p4: GCA_000001405.5`<br>• `GRCh37.p5: GCA_000001405.6`<br>• `GRCh37.p6: GCA_000001405.7`<br>• `GRCh37.p7: GCA_000001405.8`<br>• `GRCh37.p8: GCA_000001405.9`<br>• `GRCh37.p9: GCA_000001405.10`<br>• `GRCh37: GCA_000001405.1`<br>• `GRCh38.p10: GCA_000001405.25`<br>• `GRCh38.p11: GCA_000001405.26`<br>• `GRCh38.p12: GCA_000001405.27`<br>• `GRCh38.p13: GCA_000001405.28`<br>• `GRCh38.p14: GCA_000001405.29`<br>• `GRCh38.p2: GCA_000001405.17`<br>• `GRCh38.p3: GCA_000001405.18`<br>• `GRCh38.p4: GCA_000001405.19`<br>• `GRCh38.p5: GCA_000001405.20`<br>• `GRCh38.p6: GCA_000001405.21`<br>• `GRCh38.p7: GCA_000001405.22`<br>• `GRCh38.p8: GCA_000001405.23`<br>• `GRCh38.p9: GCA_000001405.24`<br>• `GRCh38: GCA_000001405.15`<br>• `NCBI36: GCF_000001405.12` |
| description | string | Description of the analysis | yes |  |  |
| analysis_type | string | Type of analysis | yes | one of | • `REFERENCE ALIGNMENT`<br>• `SAMPLE PHENOTYPE`<br>• `SEQUENCE VARIATION` |
| experiment_types | array[string] | Types of experiment | yes |  | comma-separated values |
| samples | string |  | no |  |  |
| experiments | string |  | no |  |  |

## molecular_experiments.tsv

Resource Type: `MolecularExperiment`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>title</u> | string | The experiment alias | yes | unique |  |
| library_layout | string | Layout (paired or single) of the sequencing library | yes | one of | • `PAIRED`<br>• `SINGLE` |
| library_source | string | Source/type of the sequencing library | yes | one of | • `GENOMIC`<br>• `GENOMIC SINGLE CELL`<br>• `METAGENOMIC`<br>• `METATRANSCRIPTOMIC`<br>• `OTHER`<br>• `SYNTHETIC`<br>• `TRANSCRIPTOMIC`<br>• `TRANSCRIPTOMIC SINGLE CELL`<br>• `VIRAL RNA` |
| library_strategy | string |  | yes | one of | • `AMPLICON`<br>• `ATAC-seq`<br>• `Bisulfite-Seq`<br>• `CLONE`<br>• `CLONEEND`<br>• `CTS`<br>• `ChIA-PET`<br>• `ChIP-Seq`<br>• `ChM-Seq`<br>• `DNase-Hypersensitivity`<br>• `EST`<br>• `FAIRE-seq`<br>• `FINISHING`<br>• `FL-cDNA`<br>• `GBS`<br>• `Hi-C`<br>• `MBD-Seq`<br>• `MNase-Seq`<br>• `MRE-Seq`<br>• `MeDIP-Seq`<br>• `NOMe-Seq`<br>• `OTHER`<br>• `POOLCLONE`<br>• `RAD-Seq`<br>• `RIP-Seq`<br>• `RNA-Seq`<br>• `Ribo-Seq`<br>• `SELEX`<br>• `Synthetic-Long-Read`<br>• `Targeted-Capture`<br>• `Tethered Chromatin Conformation Capture`<br>• `Tn-Seq`<br>• `VALIDATION`<br>• `WCS`<br>• `WGA`<br>• `WGS`<br>• `WXS`<br>• `miRNA-Seq`<br>• `ncRNA-Seq`<br>• `snRNA-seq`<br>• `ssRNA-seq` |
| library_selection | string | Method the select the genomic molecules for sequencing | yes | one of | • `5-methylcytidine antibody`<br>• `CAGE`<br>• `ChIP`<br>• `ChIP-Seq`<br>• `DNase`<br>• `HMPR`<br>• `Hybrid Selection`<br>• `Inverse rRNA`<br>• `Inverse rRNA selection`<br>• `MBD2 protein methyl-CpG binding domain`<br>• `MDA`<br>• `MF`<br>• `MNase`<br>• `MSLL`<br>• `Oligo-dT`<br>• `PCR`<br>• `PolyA`<br>• `RACE`<br>• `RANDOM`<br>• `RANDOM PCR`<br>• `RT-PCR`<br>• `Reduced Representation`<br>• `Restriction Digest`<br>• `cDNA`<br>• `cDNA_oligo_dT`<br>• `cDNA_randomPriming`<br>• `other`<br>• `padlock probes capture method`<br>• `repeat fractionation`<br>• `size fractionation`<br>• `unspecified` |
| design_description | string | Description of the experimental design | yes |  |  |
| instrument_model_id | string | Model of the instrument to perform the molecular analysis (sequencer) | yes | one of | • `ABI_SOLID: AB 5500 Genetic Analyzer`<br>• `ABI_SOLID: AB 5500xl Genetic Analyzer`<br>• `ABI_SOLID: AB 5500xl-W Genetic Analysis System`<br>• `ABI_SOLID: AB SOLiD 3 Plus System`<br>• `ABI_SOLID: AB SOLiD 4 System`<br>• `ABI_SOLID: AB SOLiD 4hq System`<br>• `ABI_SOLID: AB SOLiD PI System`<br>• `ABI_SOLID: AB SOLiD System`<br>• `ABI_SOLID: AB SOLiD System 2.0`<br>• `ABI_SOLID: AB SOLiD System 3.0`<br>• `ABI_SOLID: unspecified`<br>• `BGISEQ: BGISEQ-50`<br>• `BGISEQ: BGISEQ-500`<br>• `BGISEQ: MGISEQ-2000RS`<br>• `CAPILLARY: AB 310 Genetic Analyzer`<br>• `CAPILLARY: AB 3130 Genetic Analyzer`<br>• `CAPILLARY: AB 3130xL Genetic Analyzer`<br>• `CAPILLARY: AB 3500 Genetic Analyzer`<br>• `CAPILLARY: AB 3500xL Genetic Analyzer`<br>• `CAPILLARY: AB 3730 Genetic Analyzer`<br>• `CAPILLARY: AB 3730xL Genetic Analyzer`<br>• `CAPILLARY: unspecified`<br>• `COMPLETE_GENOMICS: Complete Genomics`<br>• `COMPLETE_GENOMICS: unspecified`<br>• `DNBSEQ: DNBSEQ-G400`<br>• `DNBSEQ: DNBSEQ-G400 FAST`<br>• `DNBSEQ: DNBSEQ-G50`<br>• `DNBSEQ: DNBSEQ-T7`<br>• `DNBSEQ: unspecified`<br>• `HELICOS: Helicos HeliScope`<br>• `HELICOS: unspecified`<br>• `ILLUMINA: HiSeq X Five`<br>• `ILLUMINA: HiSeq X Ten`<br>• `ILLUMINA: Illumina Genome Analyzer`<br>• `ILLUMINA: Illumina Genome Analyzer II`<br>• `ILLUMINA: Illumina Genome Analyzer IIx`<br>• `ILLUMINA: Illumina HiScanSQ`<br>• `ILLUMINA: Illumina HiSeq 1000`<br>• `ILLUMINA: Illumina HiSeq 1500`<br>• `ILLUMINA: Illumina HiSeq 2000`<br>• `ILLUMINA: Illumina HiSeq 2500`<br>• `ILLUMINA: Illumina HiSeq 3000`<br>• `ILLUMINA: Illumina HiSeq 4000`<br>• `ILLUMINA: Illumina HiSeq X`<br>• `ILLUMINA: Illumina MiSeq`<br>• `ILLUMINA: Illumina MiniSeq`<br>• `ILLUMINA: Illumina NovaSeq 6000`<br>• `ILLUMINA: Illumina NovaSeq X`<br>• `ILLUMINA: Illumina NovaSeq X Plus`<br>• `ILLUMINA: Illumina iSeq 100`<br>• `ILLUMINA: NextSeq 1000`<br>• `ILLUMINA: NextSeq 2000`<br>• `ILLUMINA: NextSeq 500`<br>• `ILLUMINA: NextSeq 550`<br>• `ILLUMINA: unspecified`<br>• `ION_TORRENT: Ion GeneStudio S5`<br>• `ION_TORRENT: Ion GeneStudio S5 Plus`<br>• `ION_TORRENT: Ion GeneStudio S5 Prime`<br>• `ION_TORRENT: Ion Torrent Genexus`<br>• `ION_TORRENT: Ion Torrent PGM`<br>• `ION_TORRENT: Ion Torrent Proton`<br>• `ION_TORRENT: Ion Torrent S5`<br>• `ION_TORRENT: Ion Torrent S5 XL`<br>• `ION_TORRENT: unspecified`<br>• `LS454: 454 GS`<br>• `LS454: 454 GS 20`<br>• `LS454: 454 GS FLX`<br>• `LS454: 454 GS FLX Titanium`<br>• `LS454: 454 GS FLX+`<br>• `LS454: 454 GS Junior`<br>• `LS454: unspecified`<br>• `OXFORD_NANOPORE: GridION`<br>• `OXFORD_NANOPORE: MinION`<br>• `OXFORD_NANOPORE: PromethION`<br>• `OXFORD_NANOPORE: unspecified`<br>• `PACBIO_SMRT: PacBio RS`<br>• `PACBIO_SMRT: PacBio RS II`<br>• `PACBIO_SMRT: Sequel`<br>• `PACBIO_SMRT: Sequel II`<br>• `PACBIO_SMRT: Sequel IIe`<br>• `PACBIO_SMRT: unspecified` |

## molecular_runs.tsv

Resource Type: `MolecularRun`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>title</u> | string | Title of the Run | yes | unique |  |
| experiment | string |  | no |  |  |
| sample | string |  | no |  |  |
| files | array[string] | List of associated file public ids | yes | unique items | comma-separated values |
| file_type | string | Output file type of the Run | yes | one of | • `CompleteGenomics_native`<br>• `Illumina_native`<br>• `Illumina_native_qseq`<br>• `OxfordNanopore_native`<br>• `PacBio_HDF5`<br>• `SOLiD_native_csfasta`<br>• `bam`<br>• `cram`<br>• `fastq`<br>• `sff`<br>• `srf` |

## samples.tsv

Resource Type: `Sample`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>alias</u> | string | The sample alias | yes | unique |  |
| cell_line | string | The sample cell line | no |  |  |
| phenotype | string | The sample phenotype | yes |  |  |
| subject_id | string | The sample subject ID | yes |  |  |
| description | string | The sample description | no |  |  |
| biosample_id | string | The sample biosample ID | no |  |  |
| case_control | string | If the sample is the case or control. | no | one of | • `NA`<br>• `both`<br>• `case`<br>• `control` |
| organism_part | string | The sample organism part | no |  |  |
| biological_sex | string | The sample biological sex. | yes | one of | • `female`<br>• `hermaphrodite`<br>• `male`<br>• `unknown` |

## studies.tsv

Resource Type: `Study`

### Fields

| Field Name | Type | Description | Required | Constraints | Values |
|------------|------|-------------|----------|-------------|--------|
| <u>title</u> | string |  | yes | unique<br>minimum length: 3 |  |
| type | string |  | yes | one of | • `Cancer Genomics`<br>• `Epigenetics`<br>• `Exome Sequencing`<br>• `Forensic or Paleo-genomics`<br>• `Gene Regulation Study`<br>• `Metagenomics`<br>• `Pooled Clone Sequencing`<br>• `Population Genomics`<br>• `RNASeq`<br>• `Resequencing`<br>• `Synthetic Genomics`<br>• `Transcriptome Analysis`<br>• `Transcriptome Sequencing`<br>• `Whole Genome Sequencing` |
| description | string |  | no |  |  |

