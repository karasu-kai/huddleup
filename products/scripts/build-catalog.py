#!/usr/bin/env python3
"""Build peptide product catalog from LQ US-tier costs. All pricing is per vial."""

import csv
import json
from pathlib import Path

FX = 1.4322
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

# category, code, product, strength, vial_size, usd_per_vial, competitor_rrp_aud, benefits
PRODUCTS = [
("GH & Hormones", "L1-10", "97% GH", "10iu", "3ml", 9.8, 89, "Growth hormone axis; body composition and recovery research"),
("GH & Hormones", "L1-12", "97% GH", "12iu", "3ml", 13.4, 119, "Higher-dose GH research; IGF-1 and metabolic signalling"),
("GH & Hormones", "L2-5", "HCG", "5000iu", "3ml", 12.2, 95, "Gonadotropin signalling; fertility and hormonal axis research"),
("GH & Hormones", "L2-10", "HCG", "10000iu", "3ml", 22.3, 165, "Higher-potency gonadotropin; endocrine pathway studies"),
("GH & Hormones", "L3-75", "HMG", "75iu", "3ml", 9.8, 85, "Menopausal gonadotrophin; reproductive hormone research"),
("Longevity", "L4-500", "NAD+", "500mg", "5ml", 8.5, 80, "Cellular energy cofactor; mitochondrial and longevity pathways"),
("Longevity", "L4-1000", "NAD+", "1000mg", "10ml", 15.2, 150, "High-dose NAD+; sirtuin and metabolic restoration research"),
("GLP-1 / Metabolic", "Q1-5", "Semaglutide", "5mg", "3ml", 5.1, 55, "GLP-1 agonist; appetite and glucose regulation research"),
("GLP-1 / Metabolic", "Q1-10", "Semaglutide", "10mg", "3ml", 6.8, 110, "Benchmark GLP-1; metabolic and weight pathway studies"),
("GLP-1 / Metabolic", "Q1-15", "Semaglutide", "15mg", "3ml", 10.2, 145, "Mid-dose GLP-1; dose-response metabolic research"),
("GLP-1 / Metabolic", "Q1-20", "Semaglutide", "20mg", "3ml", 13.5, 175, "Higher-dose GLP-1; extended protocol research"),
("GLP-1 / Metabolic", "Q1-30", "Semaglutide", "30mg", "10ml", 18.3, 220, "Large-vial GLP-1; long-run metabolic studies"),
("GLP-1 / Metabolic", "Q1-50", "Semaglutide", "50mg", "10ml", 28.8, 320, "High-capacity GLP-1; bulk metabolic research"),
("GLP-1 / Metabolic", "Q1-60", "Semaglutide", "60mg", "10ml", 32.5, 360, "Maximum-capacity GLP-1 research vial"),
("GLP-1 / Metabolic", "Q2-5", "Tirzepatide", "5mg", "3ml", 5.1, 65, "Dual GLP-1/GIP agonist; incretin metabolic research"),
("GLP-1 / Metabolic", "Q2-10", "Tirzepatide", "10mg", "3ml", 6.8, 140, "Twincretin; advanced metabolic and weight research"),
("GLP-1 / Metabolic", "Q2-15", "Tirzepatide", "15mg", "3ml", 10.2, 175, "Mid-dose tirzepatide; dose-escalation studies"),
("GLP-1 / Metabolic", "Q2-20", "Tirzepatide", "20mg", "3ml", 13.5, 210, "Higher-dose dual agonist research"),
("GLP-1 / Metabolic", "Q2-30", "Tirzepatide", "30mg", "10ml", 18.3, 260, "Large-vial tirzepatide; extended metabolic protocols"),
("GLP-1 / Metabolic", "Q2-60", "Tirzepatide", "60mg", "10ml", 32.5, 420, "High-capacity tirzepatide research"),
("GLP-1 / Metabolic", "Q2-100", "Tirzepatide", "100mg", "10ml", 47.4, 580, "Ultra-high dose tirzepatide; long-duration research"),
("GLP-1 / Metabolic", "Q2-120", "Tirzepatide", "120mg", "10ml", 56.9, 650, "Maximum tirzepatide capacity research vial"),
("GLP-1 / Metabolic", "Q36-5", "Retatrutide", "5mg", "3ml", 8.5, 75, "Triple agonist entry dose; metabolic research"),
("GLP-1 / Metabolic", "Q36-10", "Retatrutide", "10mg", "3ml", 13.5, 130, "Triple GLP-1/GIP/glucagon; weight and metabolic research"),
("GLP-1 / Metabolic", "Q36-15", "Retatrutide", "15mg", "3ml", 20.3, 175, "Mid-dose retatrutide; dose-response metabolic studies"),
("GLP-1 / Metabolic", "Q36-20", "Retatrutide", "20mg", "3ml", 27.1, 220, "Higher-dose retatrutide; advanced metabolic research"),
("GLP-1 / Metabolic", "Q36-30", "Retatrutide", "30mg", "10ml", 32.0, 265, "Large-vial retatrutide; extended protocol research"),
("GLP-1 / Metabolic", "Q36-60", "Retatrutide", "60mg", "10ml", 54.8, 420, "High-capacity retatrutide research vial"),
("Repair", "Q3-2", "BPC-157", "2mg", "3ml", 4.1, 45, "Tissue repair peptide; gut, tendon and angiogenesis research"),
("Repair", "Q3-5", "BPC-157", "5mg", "3ml", 5.1, 55, "Mid-dose BPC-157; musculoskeletal recovery research"),
("Repair", "Q3-10", "BPC-157", "10mg", "3ml", 9.1, 80, "Standard BPC-157; widely studied repair pathways"),
("Repair", "Q3-15", "BPC-157", "15mg", "3ml", 13.7, 110, "Higher-dose BPC-157; injury recovery research"),
("Repair", "Q3-20", "BPC-157", "20mg", "3ml", 18.3, 145, "Large-dose BPC-157; extended repair protocols"),
("Repair", "Q3-25", "BPC-157", "25mg", "3ml", 22.8, 175, "Maximum single-vial BPC-157 research dose"),
("Repair", "Q4-2", "TB-500 (TB4)", "2mg", "3ml", 6.1, 55, "Thymosin beta-4; cell migration and wound healing"),
("Repair", "Q4-5", "TB-500 (TB4)", "5mg", "3ml", 10.8, 75, "Mid-dose TB-500; tissue remodelling research"),
("Repair", "Q4-10", "TB-500 (TB4)", "10mg", "3ml", 22.0, 110, "Standard TB-500; angiogenesis and repair studies"),
("Repair", "Q4-20", "TB-500 (TB4)", "20mg", "3ml", 44.0, 195, "High-dose TB-500; advanced recovery research"),
("Repair", "Y7-5", "TB-500 Frag (17-23)", "5mg", "3ml", 5.4, 55, "TB4 fragment; targeted actin and migration research"),
("Repair", "Y7-10", "TB-500 Frag (17-23)", "10mg", "3ml", 10.8, 85, "Standard TB fragment; wound healing research"),
("Repair", "Y7-20", "TB-500 Frag (17-23)", "20mg", "3ml", 17.3, 130, "High-dose TB fragment; tissue repair studies"),
("Cosmetic / Repair", "Q5-50", "GHK-Cu", "50mg", "3ml", 8.8, 70, "Copper peptide; collagen synthesis and skin repair"),
("Cosmetic / Repair", "Q5-100", "GHK-Cu", "100mg", "3ml", 16.9, 120, "High-dose GHK-Cu; cosmetic and wound research"),
("GH Axis", "Q7-1", "IGF-1 LR3", "1mg", "3ml", 37.2, 165, "Growth factor; muscle and cellular growth research"),
("GH Axis", "Q17-2", "CJC-1295 No DAC", "2mg", "3ml", 5.1, 50, "GHRH analogue; pulsatile GH release research"),
("GH Axis", "Q17-5", "CJC-1295 No DAC", "5mg", "3ml", 11.8, 85, "Mid-dose GHRH; GH axis stimulation"),
("GH Axis", "Q17-10", "CJC-1295 No DAC", "10mg", "3ml", 20.3, 145, "Standard CJC no DAC; GH secretagogue research"),
("GH Axis", "Q20-5", "Ipamorelin", "5mg", "3ml", 5.1, 55, "Selective GHRP; clean GH pulse without cortisol spike"),
("GH Axis", "Q20-10", "Ipamorelin", "10mg", "3ml", 10.2, 90, "Standard ipamorelin; GH axis and recovery research"),
("GH Axis", "Q22-2", "Sermorelin", "2mg", "3ml", 5.4, 50, "GHRH fragment; natural GH rhythm research"),
("GH Axis", "Q22-5", "Sermorelin", "5mg", "3ml", 10.8, 80, "Mid-dose sermorelin; anti-ageing GH research"),
("GH Axis", "Q22-10", "Sermorelin", "10mg", "3ml", 21.0, 140, "Standard sermorelin; GH deficiency model research"),
("GH Axis", "Q24-5", "Tesamorelin", "5mg", "3ml", 13.5, 110, "GHRH analogue; visceral fat and GH research"),
("GH Axis", "Q24-10", "Tesamorelin", "10mg", "3ml", 27.1, 185, "Standard tesamorelin; lipodystrophy and GH studies"),
("Neuropeptides", "Q11-10", "PT-141 (Bremelanotide)", "10mg", "3ml", 10.5, 95, "Melanocortin agonist; sexual function pathway research"),
("Neuropeptides", "Q12-10", "MT-2 (Melanotan II)", "10mg", "3ml", 8.1, 75, "Melanocortin peptide; pigmentation and libido research"),
("Neuropeptides", "Q23-5", "Oxytocin", "5mg", "3ml", 8.5, 75, "Neuropeptide; bonding, mood and social behaviour research"),
("Neuropeptides", "Q23-10", "Oxytocin", "10mg", "3ml", 13.5, 110, "Higher-dose oxytocin; neuroendocrine studies"),
("Neuropeptides", "Q26-5", "DSIP", "5mg", "3ml", 5.1, 55, "Sleep-inducing peptide; circadian and sleep architecture research"),
("Neuropeptides", "Q26-10", "DSIP", "10mg", "3ml", 9.5, 85, "Standard DSIP; delta sleep pathway studies"),
("Neuropeptides", "Q27-10", "Selank", "10mg", "3ml", 8.8, 80, "Anxiolytic peptide; GABA and stress response research"),
("Neuropeptides", "Q27-20", "Selank", "20mg", "3ml", 16.7, 130, "Higher-dose selank; cognitive and anxiety research"),
("Neuropeptides", "Q28-10", "Semax", "10mg", "3ml", 8.8, 80, "Nootropic peptide; BDNF and neuroprotection research"),
("Neuropeptides", "Q28-30", "Semax", "30mg", "3ml", 23.8, 175, "High-dose semax; cognitive enhancement research"),
("Longevity", "Q29-10", "Epithalon (Epitalon)", "10mg", "3ml", 6.8, 70, "Telomerase peptide; longevity and pineal research"),
("Longevity", "Q30-10", "MOTS-C (Human)", "10mg", "3ml", 10.8, 90, "Mitochondrial peptide; metabolic and exercise capacity research"),
("Longevity", "Q30-20", "MOTS-C (Human)", "20mg", "3ml", 21.7, 130, "Mid-dose MOTS-C; AMPK and insulin sensitivity research"),
("Longevity", "Q30-40", "MOTS-C (Human)", "40mg", "3ml", 39.0, 165, "High-dose MOTS-C; mitochondrial longevity research"),
("Longevity", "Q30-50", "MOTS-C (Human)", "50mg", "3ml", 48.7, 195, "Maximum MOTS-C; advanced metabolic research"),
("Longevity", "Y38-5", "SS-31 (Elamipretide)", "5mg", "3ml", 6.8, 65, "Mitochondrial peptide; oxidative stress and cardioprotection research"),
("Longevity", "Y38-10", "SS-31 (Elamipretide)", "10mg", "3ml", 13.5, 110, "Standard SS-31; mitochondrial membrane research"),
("Longevity", "Y38-50", "SS-31 (Elamipretide)", "50mg", "3ml", 60.9, 195, "High-dose SS-31; advanced mitochondrial research"),
("Immune", "Q32-5", "Thymosin Alpha-1 (TA-1)", "5mg", "3ml", 11.8, 95, "Immune modulator; T-cell and antiviral research"),
("Immune", "Q32-10", "Thymosin Alpha-1 (TA-1)", "10mg", "3ml", 22.0, 155, "Standard TA-1; immune restoration research"),
("Immune", "Y23-10", "KPV", "10mg", "3ml", 8.5, 75, "Anti-inflammatory tripeptide; gut and skin inflammation research"),
("Bioregulators", "Y6-20", "Pinealon", "20mg", "3ml", 14.2, 95, "Bioregulator; brain tissue and cognitive ageing research"),
("Bioregulators", "Y34-20", "Vilon", "20mg", "3ml", 14.2, 90, "Bioregulator; immune system modulation research"),
("Bioregulators", "Y41-20", "Vesugen", "20mg", "3ml", 13.5, 90, "Bioregulator; vascular and endothelial research"),
("Bioregulators", "Y42-20", "Testagen", "20mg", "3ml", 16.9, 95, "Bioregulator; testicular tissue and hormonal research"),
("Bioregulators", "Y43-20", "Chonluten", "20mg", "3ml", 13.5, 90, "Bioregulator; lung and bronchial tissue research"),
("Bioregulators", "Y46-20", "Livagen", "20mg", "3ml", 16.9, 95, "Bioregulator; liver tissue and detoxification research"),
("Bioregulators", "Y47-20", "Cardiogen", "20mg", "3ml", 13.5, 90, "Bioregulator; cardiac tissue and cardiovascular research"),
("Bioregulators", "Y63-20", "Prostamax", "20mg", "3ml", 13.5, 90, "Bioregulator; prostate tissue research"),
("Bioregulators", "Y64-20", "Cartalax", "20mg", "3ml", 13.5, 90, "Bioregulator; cartilage and joint tissue research"),
("Bioregulators", "Y76-20", "Pancragen", "20mg", "3ml", 14.2, 95, "Bioregulator; pancreatic tissue research"),
("Bioregulators", "Y77-20", "Cortagen", "20mg", "3ml", 15.2, 95, "Bioregulator; adrenal and stress-axis research"),
("Bioregulators", "Y78-20", "Ovagen", "20mg", "3ml", 15.2, 95, "Bioregulator; ovarian tissue research"),
("Blends", "TB-5/5", "Blend BPC-157 + TB-500", "5mg+5mg", "3ml", 14.2, 120, "Dual repair stack; combined tendon and migration pathways"),
("Blends", "TB-10/10", "Blend BPC-157 + TB-500", "10mg+10mg", "3ml", 27.1, 185, "Standard repair blend; synergistic tissue recovery research"),
("Blends", "BTG-10/10/50", "Blend BPC-157 + TB-500 + GHK-Cu", "10+10+50mg", "5ml", 33.8, 175, "GLOW-style stack; repair, copper peptide and remodelling"),
("Blends", "BTGK-10/10/50/10", "KLOW Blend", "10+10+50+10mg", "5ml", 38.9, 280, "Four-compound stack; repair, skin, and anti-inflammatory research"),
("Blends", "CI-5/5", "Blend CJC-1295 + Ipamorelin", "5mg+5mg", "3ml", 15.2, 120, "GH stack; synergistic GH pulse research"),
("Blends", "CI-10/10", "Blend CJC-1295 + Ipamorelin", "10mg+10mg", "3ml", 28.8, 195, "Standard GH blend; body composition and recovery research"),
("Blends", "SS-5/5", "Blend Selank + Semax", "5mg+5mg", "3ml", 10.2, 95, "Nootropic-anxiolytic stack; mood and cognition research"),
("Blends", "SS-10/10", "Blend Selank + Semax", "10mg+10mg", "3ml", 18.6, 145, "Standard selank/semax; neuroprotection research"),
("Blends", "SS-15/15", "Blend Selank + Semax", "15mg+15mg", "3ml", 27.4, 195, "High-dose neuro stack; advanced cognitive research"),
("Blends", "TI-5/5", "Blend Tesamorelin + Ipamorelin", "5mg+5mg", "3ml", 20.3, 155, "GH fat-loss stack; visceral fat and GH research"),
("Supplies", "Y73-3", "Sterile Normal Saline", "3ml", "3ml", 0.5, 8, "Reconstitution diluent; 0.9% sodium chloride"),
("Supplies", "Y73-10", "Sterile Normal Saline", "10ml", "10ml", 1.0, 12, "Large-volume saline diluent"),
("Supplies", "Y74-3", "Bacteriostatic Water", "3ml", "3ml", 0.6, 10, "Reconstitution diluent; 0.9% benzyl alcohol"),
("Supplies", "Y74-10", "Bacteriostatic Water", "10ml", "10ml", 1.1, 15, "Standard BAC water for peptide reconstitution"),
("Supplies", "Y74-30", "Bacteriostatic Water", "30ml", "30ml", 3.5, 35, "Large-volume BAC water for multi-vial protocols"),
]


def row(category, code, product, strength, vial_size, usd, rrp, benefits):
    aud = round(usd * FX, 2)
    return {
        "category": category,
        "code": code,
        "product": product,
        "strength_per_vial": strength,
        "vial_size": vial_size,
        "usd_cost_per_vial": usd,
        "aud_cost_per_vial": aud,
        "my_rrp_per_vial_aud": None,
        "competitor_rrp_per_vial_aud": rrp,
        "benefits": benefits,
    }


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    catalog = [row(*p) for p in PRODUCTS]

    meta = {
        "source": "LQ Lab Peptides Price List 2026 (US tier / under 100 vials)",
        "fx_rate_usd_aud": FX,
        "pricing_unit": "per vial",
        "competitor_rrp_note": "Average AUD RRP from AU and intl research suppliers (Jul 2026)",
        "product_count": len(catalog),
    }

    (DATA / "catalog.json").write_text(
        json.dumps({"meta": meta, "products": catalog}, indent=2), encoding="utf-8"
    )

    csv_path = DATA / "catalog.csv"
    fields = [
        "category", "code", "product", "strength_per_vial", "vial_size",
        "usd_cost_per_vial", "aud_cost_per_vial", "my_rrp_per_vial_aud",
        "competitor_rrp_per_vial_aud", "benefits",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for item in catalog:
            w.writerow({**item, "my_rrp_per_vial_aud": ""})

    print(f"Built {len(catalog)} products -> {csv_path}")


if __name__ == "__main__":
    main()
