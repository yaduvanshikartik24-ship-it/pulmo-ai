#!/bin/bash
# Extract key clinical sections from Light's Pleural Diseases chapters into a digest
cd /home/z/my-project/extracted/pleural-chapters
OUT=/home/z/my-project/extracted/pleural_digest.txt
> $OUT

dump() {
  echo "" >> $OUT
  echo "######################## $1 [$2] ########################" >> $OUT
  rg -B2 -A14 "$3" "$2" 2>/dev/null | head -"$4" >> $OUT
}

dump "GLUCOSE" ch07-clinical-tests.txt "Glucose.*[Mm]easurement|glucose level.*60 mg|glucose less than" 60
dump "APPEARANCE OF FLUID" ch07-clinical-tests.txt "Appearance of the Pleural Fluid|appearance of pleural fluid" 50
dump "CELL COUNT DIFFERENTIAL" ch07-clinical-tests.txt "Cell Count and Differential|neutrophils predominate|lymphocytes predominate" 80
dump "EOSINOPHILS" ch07-clinical-tests.txt "Eosinophilic Pleural Effusions|pleural fluid eosinophilia" 60
dump "MESOTHELIAL CELLS" ch07-clinical-tests.txt "mesothelial cells" 40
dump "CYTOLOGY YIELD" ch07-clinical-tests.txt "Cytologic Examination|positive cytology|yield.*cytology" 50
dump "ADA" ch07-clinical-tests.txt "Adenosine Deaminase|ADA level" 70
dump "IFN-GAMMA" ch07-clinical-tests.txt "Interferon-Gamma|interferon-gamma" 40
dump "NT-proBNP" ch07-clinical-tests.txt "NT-pro-BNP|pro-BNP|brain natriuretic" 50
dump "TRIGLYCERIDES CHYLOUS" ch07-clinical-tests.txt "triglyceride" 60
dump "CHOLESTEROL PSEUDOCHYLOUS" ch07-clinical-tests.txt "cholesterol" 50
dump "AMYLASE" ch07-clinical-tests.txt "amylase" 60
dump "RBC HEMORRHAGIC" ch07-clinical-tests.txt "red blood cell|RBC count|hemorrhagic" 50
dump "ANTINUCLEAR RF" ch07-clinical-tests.txt "rheumatoid factor|antinuclear" 40
dump "ELASTANCE MANOMETRY" ch07-clinical-tests.txt "elastance|pleural pressure.*removal|manometry" 60
dump "IMMUNOLOGY TUMOR MARKERS" ch07-clinical-tests.txt "mesothelin|HYALURONIC|hyaluronic acid" 40

dump "EFFUSION VOLUME DETECTION" ch06-radiology.txt "lateral decubitus|costophrenic|blunting|meniscus" 80
dump "CT IMAGING PLEURAL" ch06-radiology.txt "computed tomography|CT scan" 40
dump "ULTRASOUND PLEURAL" ch06-radiology.txt "ultrasound|sonographic|echogenic|septat" 70
dump "MASSIVE EFFUSION" ch06-radiology.txt "massive|entire hemithorax" 40
dump "PNEUMOTHORAX IMAGING SIZE" ch06-radiology.txt "pneumothorax.*size|interpleural distance|size.*pneumothorax" 50

dump "PARAPNEUMONIC CLASSIFICATION" ch12-parapneumonic.txt "[Cc]ategory [1-4]|classification.*parapneumonic" 90
dump "PPE PH GLUCOSE DRAINAGE" ch12-parapneumonic.txt "pH.*7\.2|chest tube.*parapneumonic|drainage" 80
dump "TPA DNASE" ch12-parapneumonic.txt "DNase|tissue plasminogen|tPA" 60
dump "EMPYEMA MICROBIOLOGY" ch12-parapneumonic.txt "[Cc]ulture|Streptococcus|anaerobe|Staphylococcus" 50

dump "TB ADA LYMPHOCYTE" ch13-tuberculous.txt "ADA|lymphocyte|interferon" 70
dump "TB TREATMENT OUTCOME" ch13-tuberculous.txt "[Tt]reatment|steroid|prednisone" 40

dump "CHF TRANSUDATE" ch09-transudates.txt "heart failure|diuretic|pseudoexudate" 60
dump "HEPATIC HYDROTHORAX" ch09-transudates.txt "hepatic hydrothorax|cirrhosis" 60

dump "MPE CYTOLOGY PROGNOSIS" ch10-metastatic.txt "median survival|prognos|cytology.*positive" 60
dump "MPE MANAGEMENT" ch10-metastatic.txt "indwelling|pleurodesis|talc|chest tube.*malignant" 80

dump "MESOTHELIOMA DIAGNOSIS" ch11-primary-tumors.txt "mesothelin|biopsy|survival|staging" 70

dump "HEMOTHORAX CRITERIA" ch25-hemothorax.txt "hematocrit|hemothorax.*defined|5\d\d ml|retained hemothorax" 60

dump "CHYLOTHORAX TG CRITERIA" ch26-chylothorax.txt "triglyceride.*1 10|110 mg|chylous|lymphocyte" 80
dump "PSEUDOCHYLOTHORAX" ch26-chylothorax.txt "pseudochylothorax|cholesterol crystal|cholesterol.*200" 60

dump "PSP SSP MANAGEMENT" ch24-pneumothorax.txt "aspiration|chest tube.*pneumothorax|observation.*pneumothorax" 90
dump "PNEUMOTHORAX SIZE CRITERIA" ch24-pneumothorax.txt "2 cm|large pneumothorax|size.*[Cc]ategory|BTS|ACCP" 70
dump "TENSION PNX" ch24-pneumothorax.txt "tension" 40
dump "CATAMENIAL" ch24-pneumothorax.txt "catamenial" 30
dump "PNX RECURRENCE VATS" ch24-pneumothorax.txt "recurrence|VATS|pleurodesis|sclerosis" 60

dump "RA PLEURITIS" ch21-collagen.txt "rheumatoid" 70
dump "LUPUS PLEURITIS" ch21-collagen.txt "lupus|LE cells|ANA" 60

dump "DASATINIB DRUGS" ch22-drugs.txt "dasatinib|nitrofurantoin|amiodarone|bromocriptine|methysergide" 70

dump "ESOPHAGEAL RUPTURE" ch18-GI.txt "esophageal rupture|perforation|amylase.*salivary|Boerhaave" 60
dump "PANCREATIC EFFUSION" ch18-GI.txt "pancreatic|amylase" 50
dump "MEIGS" ch18-GI.txt "Meigs" 30
dump "SUBPHRENIC ABSCESS" ch18-GI.txt "subphrenic|subdiaphragmatic abscess" 40

dump "POST CABG PERICARDIOTOMY" ch19-heart.txt "postcardiac injury|pericardiotomy|post-CABG|postcoronary" 70
dump "PE EFFUSION" ch17-PE.txt "pulmonary embol|inflated|scintigraphy" 50

dump "TRAPPED LUNG" ch23-misc.txt "trapped lung|lung entrapment|unexpandable" 60
dump "UREMIA" ch23-misc.txt "uremic" 30
dump "YELLOW NAIL" ch23-misc.txt "yellow nail" 30
dump "ASBESTOS EFFUSION" ch23-misc.txt "asbestos" 40

dump "THORACENTESIS COMPLICATIONS" ch28-thoracentesis.txt "complication|reexpansion|re-expansion|pneumothorax.*rate|cough" 80
dump "THORACENTESIS TECHNIQUE" ch28-thoracentesis.txt "ultrasound|needle|midaxillary|eight" 60
dump "PLEURAL BIOPSY" ch28-thoracentesis.txt "needle biopsy|Abrams|Cope|image-guided" 60

dump "CHEST TUBE SIZE" ch29-chest-tubes.txt "small.*chest tube|[Ss]ize.*French|pigtail|[Ff]rench" 70
dump "DRAINAGE SYSTEM" ch29-chest-tubes.txt "three-bottle|water seal|suction" 40

echo "digest written: $(wc -l < $OUT) lines, $(du -h $OUT | cut -f1)"
