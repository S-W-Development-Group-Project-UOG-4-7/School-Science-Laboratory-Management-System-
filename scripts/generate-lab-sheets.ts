
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const LAB_SHEETS_DIR = path.join(process.cwd(), 'public', 'lab-sheets');

if (!fs.existsSync(LAB_SHEETS_DIR)) {
    fs.mkdirSync(LAB_SHEETS_DIR, { recursive: true });
}

interface LabSheetContent {
    filename: string;
    title: string;
    subject: string;
    grade: string;
    objective: string;
    materials: string[];
    procedure: string[];
    questions: string[];
}

const labSheets: LabSheetContent[] = [
    {
        filename: 'Grade_11_Acid_Base_Titration_Lab_Sheet.pdf',
        title: 'Acid-Base Titration',
        subject: 'Chemistry',
        grade: 'Grade 11',
        objective: 'To determine the concentration of a standard Hydrochloric Acid (HCl) solution using a standard Sodium Hydroxide (NaOH) solution via titration.',
        materials: [
            'Burette (50mL)',
            'Pipette (25mL)',
            'Conical Flask (250mL)',
            'Retort Stand and Clamp',
            'White Tile',
            'Phenolphthalein Indicator',
            '0.1M NaOH Solution',
            'Unknown Concentration HCl Solution',
            'Distilled Water',
            'Funnel'
        ],
        procedure: [
            '1. Wash the burette with distilled water and then rinse it with the NaOH solution.',
            '2. Fill the burette with NaOH solution up to the 0.00 mL mark. Ensure there are no air bubbles in the tip.',
            '3. Wash the pipette with distilled water and rinse with the HCl solution.',
            '4. Pipette exactly 25.0 mL of the HCl solution into a clean conical flask.',
            '5. Add 2-3 drops of Phenolphthalein indicator to the flask. The solution should remain colorless.',
            '6. Place the flask on a white tile under the burette.',
            '7. Titrate slowly while swirling the flask until a permanent pale pink color appears (end point).',
            '8. Record the final burette reading. Repeat the titration until concordant results are obtained.'
        ],
        questions: [
            '1. Calculate the average volume of NaOH used.',
            '2. Write the balanced chemical equation for the reaction.',
            '3. Calculate the molarity of the HCl solution.',
            '4. Why is a white tile used during titration?'
        ]
    },
    {
        filename: 'microscope_practical_lab_sheet.pdf',
        title: 'Microscope Usage and Cell Observation',
        subject: 'Biology',
        grade: 'Grade 9',
        objective: 'To learn the proper handling of a compound light microscope and to observe plant (onion epidermis) and animal (cheek) cells.',
        materials: [
            'Compound Light Microscope',
            'Glass Slides and Cover Slips',
            'Onion Bulb',
            'Forceps',
            'Iodine Solution',
            'Methylene Blue Stain',
            'Toothpicks (for cheek cells)',
            'Dropper',
            'Distilled Water'
        ],
        procedure: [
            'Part A: Plant Cells (Onion Epidermis)',
            '1. Peel a thin layer of epidermis from the inside of an onion scale leaf.',
            '2. Place it on a glass slide with a drop of water.',
            '3. Add a drop of Iodine solution to stain the nucleus.',
            '4. Gently lower a cover slip to avoid air bubbles.',
            '5. Observe under low power (10x) and then medium power (40x).',
            '',
            'Part B: Animal Cells (Cheek Cells)',
            '1. Gently scrape the inside of your cheek with a clean toothpick.',
            '2. Smear the scraping onto a clean glass slide.',
            '3. Add a drop of Methylene Blue stain.',
            '4. Cover with a cover slip and observe under the microscope.'
        ],
        questions: [
            '1. Draw a labeled diagram of the onion cell and cheek cell.',
            '2. What are the key differences observed between the plant and animal cells?',
            '3. Why are stains used in microscopy?',
            '4. What is the function of the cell wall?'
        ]
    },
    {
        filename: 'simple_pendulum_experiment_lab_sheet.pdf',
        title: 'Simple Pendulum Experiment',
        subject: 'Physics',
        grade: 'Grade 10',
        objective: 'To investigate the relationship between the length of a simple pendulum and its time period, and to determine the acceleration due to gravity (g).',
        materials: [
            'Retort Stand',
            'Split Cork',
            'Thread (approx. 1m)',
            'Bob (Metal Sphere)',
            'Stopwatch',
            'Meter Rule'
        ],
        procedure: [
            '1. Set up the pendulum by attaching the bob to the thread and suspending it from the clamp.',
            '2. Measure the length (L) from the point of suspension to the center of the bob.',
            '3. Displace the bob slightly (small angle < 10 degrees) and release it.',
            '4. Measure the time taken for 20 complete oscillations.',
            '5. Calculate the time period T (Time/20).',
            '6. Repeat the experiment for different lengths (e.g., 30, 40, 50, 60, 70 cm).',
            '7. Plot a graph of L vs T².'
        ],
        questions: [
            '1. How does the time period change as the length increases?',
            '2. From the gradient of your L vs T² graph, calculate g.',
            '3. Why must the angle of oscillation be small?',
            '4. Does the mass of the bob affect the time period? Explain.'
        ]
    },
    {
        filename: 'newton_s_laws_of_motion_experiments_lab_sheet.pdf',
        title: "Newton's Laws of Motion",
        subject: 'Physics',
        grade: 'Grade 10',
        objective: 'To verify Newton\'s Second Law of Motion (F=ma) by observing the relationship between Force, Mass, and Acceleration.',
        materials: [
            'Dynamics Trolley',
            'Runway/Track',
            'Ticker Timer and Tape',
            'Power Supply (AC)',
            'Slotted Weights',
            'Pulley and String',
            'Balance'
        ],
        procedure: [
            '1. Set up the runway with the pulley at one end. Compensate for friction by tilting the track slightly.',
            '2. Attach a string to the trolley, pass it over the pulley, and hang a weight hanger.',
            '3. Thread the ticker tape through the timer attached to the back of the trolley.',
            '4. Release the trolley and switch on the timer simultaneously.',
            '5. Analyze the ticker tape to calculate acceleration.',
            '6. Repeat by increasing the hanging mass (Force) while keeping the total mass constant (transfer mass from trolley to hanger).',
            '7. Plot a graph of Force vs Acceleration.'
        ],
        questions: [
            '1. State Newton\'s Second Law of Motion.',
            '2. Describe the relationship between Force and Acceleration observed.',
            '3. What does the gradient of the F vs a graph represent?',
            '4. Why is it important to compensate for friction?'
        ]
    },
    {
        filename: 'qualitative_analysis_of_salts_lab_sheet.pdf',
        title: 'Qualitative Analysis of Salts',
        subject: 'Chemistry',
        grade: 'Grade 12',
        objective: 'To identify the cation and anion present in a given unknown salt sample through systematic qualitative analysis.',
        materials: [
            'Test Tubes and Rack',
            'Bunsen Burner',
            'Nichrome Wire',
            'Dilute HCl, HNO3',
            'NaOH Solution',
            'NH4OH Solution',
            'AgNO3 Solution',
            'BaCl2 Solution',
            'Limewater',
            'Unknown Salt Samples'
        ],
        procedure: [
            '1. Preliminary Tests: Note color, solubility, and appearance.',
            '2. Flame Test: Clean nichrome wire in HCl. Dip in salt paste. Hold in flame. Observe color.',
            '   (Yellow=Na, Lilac=K, Brick Red=Ca, Apple Green=Ba, Blue-Green=Cu)',
            '3. Cation Analysis: Add NaOH dropwise then in excess. Repeat with NH4OH. Observe precipitates.',
            '4. Anion Analysis:',
            '   - Carbonate test: Add dilute acid. Check for effervescence (CO2) turning limewater milky.',
            '   - Chloride test: Add dilute HNO3 then AgNO3. White ppt = Chloride.',
            '   - Sulfate test: Add dilute HCl then BaCl2. White ppt = Sulfate.'
        ],
        questions: [
            '1. Identify the cation if a white precipitate dissolves in excess NaOH.',
            '2. Identify the anion that forms a yellow precipitate with AgNO3.',
            '3. Why is the nichrome wire cleaned with HCl?',
            '4. Write the ionic equation for the test for Chloride ions.'
        ]
    },
    {
        filename: 'photosynthesis_experiment_lab_sheet.pdf',
        title: 'Photosynthesis Experiment',
        subject: 'Biology',
        grade: 'Grade 10',
        objective: 'To investigate the effect of light intensity on the rate of photosynthesis using an aquatic plant.',
        materials: [
            'Hydrilla or Elodea plant',
            'Beaker',
            'Funnel',
            'Test Tube',
            'Lamp/Light Source',
            'Sodium Bicarbonate (source of CO2)',
            'Stopwatch',
            'Meter Ruler'
        ],
        procedure: [
            '1. Place the Hydrilla plant in a beaker of water mixed with a pinch of Sodium Bicarbonate.',
            '2. Cover the plant with an inverted funnel.',
            '3. Place an inverted water-filled test tube over the funnel stem.',
            '4. Place the lamp at a distance of 10cm from the beaker.',
            '5. Allow the plant to adjust for 5 minutes.',
            '6. Count the number of bubbles produced in 1 minute.',
            '7. Repeat the count twice and calculate the average.',
            '8. Repeat the experiment at distances of 20cm, 30cm, 40cm, and 50cm.'
        ],
        questions: [
            '1. What gas is released in the bubbles?',
            '2. How does the rate of bubbling change with distance?',
            '3. What is the relationship between light intensity and distance?',
            '4. Why is Sodium Bicarbonate added to the water?'
        ]
    }
];

async function createLabSheet(content: LabSheetContent) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;

    // Title
    page.drawText(content.title, {
        x: 50,
        y,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0.6),
    });
    y -= 30;

    // Header Info
    page.drawText(`Subject: ${content.subject} | Grade: ${content.grade}`, {
        x: 50,
        y,
        size: 12,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
    });
    y -= 40;

    const drawSection = (title: string, items: string[] | string) => {
        // Check for page break (simplified)
        if (y < 100) {
            // In a real robust script we'd add a new page, but for this simple content 1 page should suffice
            // or we just let it run off. Optimized for single page summaries.
        }

        page.drawText(title, {
            x: 50,
            y,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        y -= 20;

        if (Array.isArray(items)) {
            items.forEach(item => {
                // Very basic text wrapping or truncation logic could go here
                // For now, assume lines fit or just draw them
                if (y < 50) return;
                page.drawText(item, {
                    x: 60,
                    y,
                    size: 10,
                    font: font,
                    maxWidth: width - 110,
                });
                y -= 15;
            });
        } else {
            page.drawText(items, {
                x: 50, // aligned with section title if it's a block
                y,
                size: 10,
                font: font,
                maxWidth: width - 100,
                lineHeight: 14,
            });
            // Estimates height taken
            y -= (Math.ceil(items.length / 90) * 14);
        }
        y -= 20; // Spacing after section
    };

    drawSection('Objective:', content.objective);
    drawSection('Materials:', content.materials);
    drawSection('Procedure:', content.procedure);
    drawSection('Discussion Questions:', content.questions);

    // Footer
    page.drawText('School Science Lab Portal - Generated Lab Sheet', {
        x: width / 2 - 100,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.6, 0.6, 0.6)
    });

    const pdfBytes = await pdfDoc.save();
    const filePath = path.join(LAB_SHEETS_DIR, content.filename);
    fs.writeFileSync(filePath, pdfBytes);
    console.log(`✅ Generated: ${content.filename}`);
}

async function main() {
    console.log('📄 Generating PDF Lab Sheets...');
    for (const sheet of labSheets) {
        try {
            await createLabSheet(sheet);
        } catch (e) {
            console.error(`❌ Failed to generate ${sheet.filename}:`, e);
        }
    }
    console.log('✨ All lab sheets generated!');
}

main().catch(console.error);
