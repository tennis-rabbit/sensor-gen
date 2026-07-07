# SensorGen — Dataset Access Guide

SensorGen is built entirely from **publicly available** sensor datasets. We do **not**
redistribute any raw data. To reproduce our settings, obtain each dataset from its
official source below (subject to that source's license and access terms), then run our
preprocessing pipeline from the [code repository](https://github.com/yang-ai-lab/SensorGen).

> Links point to official data portals or the dataset paper. Please verify the current
> access procedure and license for each source before use.

| Dataset | Domain | Reference (dataset paper) | Access |
|---|---|---|---|
| **MIMIC-IV ECG** | Emergency Department | Gow et al. *MIMIC-IV-ECG: Diagnostic Electrocardiogram Matched Subset* (2023) | [PhysioNet](https://physionet.org/content/mimic-iv-ecg/) (credentialed) |
| **PPG-DaLiA** | Daily Life | Reiss et al. *Deep PPG: Large-scale Heart Rate Estimation with Convolutional Neural Networks.* Sensors (2019) | [UCI ML Repository](https://archive.ics.uci.edu/dataset/495/ppg+dalia) |
| **CAPTURE-24** | Daily Life | Chan et al. *CAPTURE-24: A Large Dataset of Wrist-worn Activity Tracker Data Collected in the Wild for Human Activity Recognition.* Scientific Data (2024) | Oxford / OxWearables — *verify link* |
| **Metabonet** | Daily Life | Metwally et al. *Insulin Resistance Prediction from Wearables and Routine Blood Biomarkers.* Nature (2026) | See dataset paper — *verify link* |
| **PhyMER** | Lab Study | Pant et al. *PhyMER: Physiological Dataset for Multimodal Emotion Recognition with Personality as a Context.* IEEE Access (2023) | See dataset paper — *verify link* |
| **SHHS** | Lab Study | Quan et al. *The Sleep Heart Health Study: Design, Rationale, and Methods.* Sleep (1997); Zhang et al. *The National Sleep Research Resource: Towards a Sleep Data Commons.* JAMIA (2018) | [NSRR / sleepdata.org](https://sleepdata.org/datasets/shhs) (request access) |
| **VitalDB** | Operation Room | Lee et al. *VitalDB, a High-fidelity Multi-parameter Vital Signs Database in Surgical Patients.* Scientific Data (2022) | [vitaldb.net](https://vitaldb.net/) |

## Notes

- Several sources (MIMIC-IV, SHHS) require credentialed access and a signed data use
  agreement. Follow each portal's instructions; we cannot grant access on their behalf.
- For entries marked *verify link*, please confirm the canonical download URL with the
  dataset authors / paper before publishing.
- Preprocessing scripts, task construction, and train/test splits used in SensorGen are
  released in the [code repository](https://github.com/yang-ai-lab/SensorGen).
