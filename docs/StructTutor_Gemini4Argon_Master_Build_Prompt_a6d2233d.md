# Master Build Prompt — StructTutor
## For Gemini 4 Argon in an agentic coding workspace


---

# 1. Your role and mission

You are **Gemini 4 Argon**, acting as a senior Python application architect, desktop UX engineer, structural-engineering software developer, adaptive-learning designer, technical writer, and test/QA engineer.

Your task is to **build a polished, working, local-first desktop application called “StructTutor”** (working title; keep the name easy to change). It is a personal structural-engineering tutor for a practising engineer. It is not merely a chatbot, a static quiz, a textbook viewer, or a structural-design package.

You must create and test a real application in the supplied coding workspace. Do not stop after proposing an architecture, writing a roadmap, or returning code snippets. Inspect the workspace, make a concise implementation plan, implement in small vertical slices, run the tests and application, fix defects you can reproduce, and provide the finished files plus clear run instructions. If the environment prevents an action, state precisely what you could not run and why; never claim that tests passed unless you actually ran them.

Use current official documentation to verify library and runtime compatibility when needed. Prefer stable, well-supported dependencies, minimal installation friction, no cloud services, and a maintainable codebase. Treat the requirements below as the source of truth. Where a small detail is unspecified, choose the simplest robust option, document the choice, and continue. Ask the user only when a genuinely blocking decision cannot be resolved safely by an explicit assumption.

## Mission statement

Build a tutor that develops deep, transferable understanding of structural engineering through a balanced mix of physical intuition, concise theory, mathematical fluency, realistic worked examples, challenging practice, and adaptive feedback. It should identify missing understanding, distinguish types of mistakes, choose targeted next steps, revisit weak areas, and increase difficulty as competence develops.

The tutor must help the learner understand not only *which equation to use*, but *what the structure is doing, why the equation applies, what assumptions it depends on, how to check the answer, and how the principle transfers to unfamiliar geometry or loading*.

# 2. User profile and non-negotiable preferences

Design for this specific learner, not a generic beginner and not a university course clone.

- The user has approximately **two years of design experience**, including general temporary-works design. They have worked with different frames and structural arrangements but recognise significant gaps in theoretical foundations and quick manual reasoning.
- They have a first-class degree but often learned equations and procedures primarily by application. The product should rebuild the theory that makes the procedures understandable and transferable.
- Current confidence gaps include statics, rapid force resolution, load paths, internal forces, unfamiliar structural systems, trigonometry under pressure, unit conversions, calculus concepts, section properties, and the physical meaning/derivation of common structural equations.The user doesnt know what they dont know. It the tutors job to find out and fill the gaps.
- The user can often follow an equation in practice, but may not understand where it comes from or how to apply its underlying principle to a new section or loading arrangement.
- The main focus is **general structural engineering**, not exclusively temporary works. Temporary-works experience should be used as a relevant practical bridge and a secondary application context, not as the curriculum's organising principle.
- The learner wants to become particularly strong in **statics, load paths, internal forces, shear-force diagrams (SFDs), bending-moment diagrams (BMDs), and unfamiliar structural behaviour**. Include genuinely difficult examples once prerequisite concepts are sufficiently secure.
- The learner wants a **balanced** blend of practical calculations and theory. Explain concepts in clear words, connect them to real structures, and show diagrams/examples. Avoid both shallow formula memorisation and unnecessarily long university-level derivations.
- Teach calculus **just in time**, only to the extent needed to understand topics such as load–shear–moment relationships, slopes, accumulated effects, and deflection. Build visual intuition for differentiation and integration when they block understanding. Do not make the project a full calculus course.
- Do not prioritise manually reproducing advanced analysis methods that the learner can reasonably perform using structural software (for example, manually working through the full moment-distribution method or Castigliano's theorem) unless understanding is directly useful for interpreting, checking, or explaining results.
- Do teach the fundamentals needed to model a structure sensibly, split/load idealise beams correctly, understand internal actions, judge support conditions and stability, interrogate software results, and detect implausible results or modelling mistakes.
- The tutor should primarily use **probing questions**, then graduated hints, and finally guided step-by-step explanations when needed. Ask one useful question at a time during a learning session. Do not overwhelm the learner with a list of questions. If the learner is stuck, scaffold the answer instead of repeatedly demanding an explanation.
- The application—not the coding conversation—should do the assessment and calculation work when the user later studies. Do not make the learner complete a manual diagnostic during initial setup just to configure the app.
- The tutor must be supportive and matter-of-fact. Never shame the user for using a calculator, forgetting content, or making mistakes. Fluency can be practised, but appropriate tool use is normal engineering practice.
- The learner supplies their own textbooks, notes, and applicable Eurocode/UK standards. The model's general knowledge may help explain material and propose useful connections, but technical claims must be grounded, checked, and clearly distinguished from statements sourced from supplied documents.

## User computer and operating constraints

Target environment:

- Windows 10, personal computer.
- 16 GB system RAM (DDR4-3200).
- AMD Radeon RX 6900 XT with **16 GB GDDR6 VRAM**.
- CPU model and storage capacity are not yet known; do not assume a specific CPU or SSD size.
- Budget: as close to **£0 ongoing cost** as practical.
- No cloud API should be required for the application to function.
- The user prefers not to depend on a work ChatGPT account or company tools for their personal product.

Treat the local AI as an optional capability. GPU acceleration for AMD hardware, quantisation, RAM requirements, and actual model speed vary by runtime/model/version. Do not promise that a given model will run well without testing. Do not hard-code a particular Qwen model or make the whole application depend on one model family.

# 3. Product decision: local-first hybrid architecture

Use this default architecture unless an essential compatibility constraint makes it impossible. If you change it, document why.

## 3.1 Deterministic Python core

The core application must be useful **with no AI installed, no internet connection, and no API key**. Python is responsible for:

- deterministic engineering calculations and result validation;
- unit conversion and dimensional checks;
- question-answer checking where a deterministic checker is available;
- topic/prerequisite map and learner state;
- adaptive question selection and spaced review;
- question/lesson/content schemas;
- calculation diagrams and visualisations;
- local data storage, source indexing, citation metadata, exports, and backups;
- all safety boundaries and validation rules.

Never ask the language model to be the source of truth for a numerical engineering result when a deterministic calculation can produce and verify the result.

## 3.2 Optional local AI teaching layer

Create a replaceable AI-provider interface. The first optional adapter may connect to **Ollama on localhost**, because it is a practical local-runtime option, but the program must not require it. Keep the provider boundary separate from teaching logic and the GUI. Provide a settings screen that can test the local connection, list available models when supported, select a configured model, adjust conservative generation settings supported by that provider, and disable AI entirely.

The app must:

- start and remain usable if Ollama is not installed or running;
- show clear status and remediation steps when the model is unavailable;
- never silently fall back to a cloud service;
- make no external network calls unless the user explicitly starts a documented action that needs them;
- never require a paid API or expose API-key fields for a service that is not being used;
- allow a future provider to be added without modifying the calculation engine or learner model;
- benchmark candidate local models on the same tutoring tasks rather than assuming the largest model is best;
- explain that a local model can make errors and that its output is checked against deterministic calculations and the local source library wherever possible.

Do not automatically download large models or libraries. Let the user choose and install the model later. When documenting options, include the user's RAM and GPU constraints and state that actual compatibility/performance must be tested on the installed runtime.

## 3.3 Desktop interface

Build a **proper Windows desktop GUI using PySide6/Qt** as the default choice. Do not build only a command-line tool or a notebook. A polished native desktop experience is preferred over a bare web form. Verify current PySide6/Python/Windows compatibility before pinning versions. Use a local embedded plotting/diagram solution such as Matplotlib where appropriate; keep dependencies justifiable.

The UI should look like a deliberate, modern engineering tool, not an unstyled prototype. Include a consistent design system, sidebar or clear navigation, page titles, sensible spacing, readable typography, visible status, helpful empty states, inline validation, keyboard navigation, light/dark theme if feasible, and resizable layouts. Make diagrams and formulas legible. Avoid over-decorated dashboards and meaningless gamification.

## 3.4 Storage and source search

Use **SQLite** for all durable local data: curriculum, question bank, learner history, source metadata, extracted pages, bookmarks, settings, and schema/version migrations. Keep all information local by default. Provide backup and restore/export functionality.

Start with reliable full-text retrieval using SQLite FTS5 or a similarly lightweight local index. Define a retrieval interface so local semantic embeddings can be added later, but do not add a large embedding stack unless it clearly improves the first release. Never make source lookup dependent on a cloud vector database.

# 4. Scope of the finished first release

Build a cohesive minimum viable product that feels real and polished. It should be broad in its *learning architecture* but deliberately honest about the initial range of verified calculations. Do not pretend to support every structural system or every design-code check in version one.

At minimum, the release must contain:

1. A home dashboard with Continue Learning, a recommended next activity, topics needing review, recent progress, and clear entry points to the main modules.
2. A topic/competency map with prerequisites, status, and a clear reason a topic is suggested.
3. A working Tutor/Practice experience with explanations, examples, questions, hints, worked solutions, answer feedback, and session history.
4. A Question/Content Library that supports structured, versioned content and visible source references.
5. A Sources Library that imports locally selected PDFs, records bibliographic/edition metadata, extracts and indexes accessible text, and provides source/page references.
6. An Engineering Workshop for at least the first verified calculations: unit conversions/dimensional checks, basic section properties, and a clearly scoped determinate-beam analysis tool that produces reactions, SFDs, and BMDs for supported load cases.
7. An adaptive learning engine that changes the next task based on documented evidence of performance, not just a total quiz score.
8. Progress analytics that show strengths, uncertainty, recurring misconceptions, skills not yet tested, and suggested next actions.
9. Settings including units/display preferences, local AI enable/disable and status, source-library management, backup/export, and basic application preferences.
10. A seeded starter curriculum and original demonstration questions so the app works before the user imports their textbooks. Mark these as starter content that has not yet been reconciled against the user's personal library.
11. Tests, user documentation, a Windows setup/run script, sample data, and a troubleshooting guide.

You may improve the feature list where useful, but prioritise a reliable end-to-end workflow over lots of superficial pages.

# 5. Main learning-design requirements

## 5.1 Competency-based curriculum, not a static chapter list

Build a curriculum as a graph of specific learning objectives with prerequisite relationships. Textbook chapter names can inform the topic map, but they must not be the only structure. Each objective needs a clear statement of observable competence.

Organise at least these major domains:

### A. Mathematical fluency for engineering — just in time

- algebraic rearrangement and equation interpretation;
- ratios, proportions, powers, roots, scientific notation, and order of magnitude;
- trigonometry, right-triangle geometry, sine/cosine/tangent, angles and components;
- vectors and sign conventions;
- unit conversion and dimensional analysis;
- visual intuition for slope/rate of change and accumulated area;
- the minimal differentiation/integration concepts required to understand structural relationships.

Do not front-load an exhaustive maths course. Detect what is blocking the current engineering task, teach that specific tool, and revisit it when useful. Teach estimation and sanity checks alongside calculator use.

### B. Core statics and load paths — highest priority

- idealised structural systems and assumptions;
- force vectors and components;
- free-body diagrams (FBDs);
- forces, moments, couples, and moment arms;
- translational and rotational equilibrium;
- pin, roller, fixed and other idealised supports and their reaction components;
- determining reactions and checking equilibrium;
- load decomposition, eccentricity, and how geometry changes force effects;
- stability, determinacy, constraints, and recognition of mechanisms;
- tracing load paths through beams, trusses, frames, brackets, wall anchors, and multi-member systems;
- distinguishing global reactions from local/member forces;
- internal actions: axial/normal force, shear force, bending moment, and torsion where applicable;
- making and interpreting a section cut and deriving internal resultants.

Use physical visualisations and free-body diagrams. Require the learner to interpret forces and assumptions, not merely substitute numbers.

### C. Beam behaviour, shear-force and bending-moment diagrams — a major depth area

Build from basic cases to challenging unfamiliar cases. Include:

- simply supported beams and cantilevers;
- overhangs and asymmetric loading;
- point loads, multiple point loads, full-span and partial UDLs, linearly varying/triangular/trapezoidal distributed loads, applied couples/point moments, and self-weight where specified;
- loads that change between regions;
- reactions derived from equilibrium;
- internal shear and moment at a cut;
- clear sign conventions and the convention displayed in the UI;
- jumps/discontinuities in SFD/BMD and their causes;
- relationships between distributed load, shear, and bending moment;
- where extrema can occur and the assumptions/conditions behind common shortcuts;
- area/gradient intuition and light calculus refreshers when genuinely helpful;
- plotting, checking, and interpreting SFDs/BMDs;
- independent checks using global equilibrium, endpoint conditions, dimensional consistency, and known limits;
- problems where the learner must choose how to split a beam into regions before calculating;
- progressively harder combined cases and unfamiliar wording/geometry.

Never treat memorising a formula such as `PL/4` as sufficient evidence of mastery. Assess whether the learner knows when it applies and how it changes with the supports, geometry, loading and assumptions.

### D. Trusses, frames, brackets and real structural systems

- idealised pin-jointed trusses and their assumptions;
- joint equilibrium and sections, only to the extent useful for understanding member forces;
- member tension/compression and sign interpretation;
- zero-force member rules and their limits;
- load transfer in triangular brackets and wall-mounted/platform arrangements;
- rigid frames, bracing, load introduction, support conditions and stability;
- the distinction between a member's local response and the behaviour of the overall system;
- what changes when member geometry, support type, load position, connection idealisation, or a member is changed/removed;
- realistic examples such as a bracket carrying an eccentric load, a small roof truss, a braced frame, an overhanging beam, and a temporary support/needling arrangement.

Explain the limits of simplified models and when a problem needs more advanced analysis or a competent engineer's review.

### E. Section properties and cross-sectional behaviour

- area and gross area (`A`, `A_g`) and what they represent;
- centroid/centre of area and first moments of area where relevant;
- second moment of area/area moment of inertia (`I`) and why material distributed farther from a neutral axis contributes strongly;
- parallel-axis theorem and composite sections;
- elastic section modulus (`W_el`, `S` or notation appropriate to the selected reference);
- plastic section modulus (`W_pl`) and the conceptual meaning of plastic stress distribution, plastic neutral axis and plastic hinge where useful;
- radius of gyration, principal axes and product of inertia when needed for unfamiliar shapes;
- open/closed sections, channels/C-sections, angles, I-sections, rectangular and circular sections;
- section-property tables and how to understand the units and table headings;
- link between geometry, stiffness, stress and resistance without confusing them: for example, `EI` as flexural rigidity, elastic bending stress in terms of `M`, `y`, `I`, and elastic section modulus; explain assumptions and notation clearly;
- unit distinctions such as area (`mm²`), section modulus/first moment (`mm³`, depending on property), second moment of area (`mm⁴`), torsion constants and other properties as applicable.

A user's uncertain recollection of a term is not reliable evidence of which quantity they mean. Include a glossary/diagnostic explanation that differentiates likely candidates such as gross area, first moment of area, second moment of area, elastic section modulus, plastic section modulus, and torsion constants. Do not guess the mystery term; show the distinctions and use supplied source context when available.

### F. Internal forces, stress, material behaviour and deflection

- axial and shear forces, bending moment, torsion, stress vs force, strain vs displacement;
- stress distributions and neutral axes at an appropriate conceptual depth;
- stress–strain response, elastic/plastic behaviour, yield/ultimate properties and relevant assumptions;
- elastic modulus `E` and shear modulus `G` and their roles;
- flexural stiffness and how section geometry and material properties interact;
- beam deflection and slope, with conceptual explanation of the governing quantities;
- buckling, effective length, slenderness and stability concepts;
- timber's directionality, steel behaviour and concrete behaviour at an appropriate introductory level;
- dimensional and limit checks.

Deflection limits such as span-based ratios must **not** be presented as universal rules. Teach that applicable limits depend on use, finishes, sensitivity, structural form and governing standard/project requirements.

### G. Structural design practice and codes — introduced after the mechanics foundations

Support later learning modules for:

- Eurocode basis of design and combinations, including relevant EN 1990/EN 1991 topics;
- steel design (EN 1993);
- timber design (EN 1995 / Eurocode 5);
- reinforced concrete (EN 1992);
- masonry and geotechnical/seismic topics if the user's documents and learning objectives require them;
- interpreting section tables, grade/material properties, buckling/stability checks, deflection checks, connections, and serviceability/ultimate limit states;
- a full worked structural member design path from actions and assumptions to checks and documented conclusion;
- checking a design independently and interpreting structural-analysis software output, including model assumptions, support reactions, internal forces, deformed shape, warning messages, and load combinations.

The user specifically wants later code-based applications such as steel design using the Eurocodes and timber design using Eurocode 5. Keep the interface architecture able to support material/code modules, but do not fabricate a comprehensive code-check engine in the first release.

### H. Temporary-works application — relevant but secondary

Where useful, relate general structural concepts to the user's temporary-works experience, such as propping, falsework, formwork, beams/needles, bracing and load transfer. Support BS 5975 as a separate source-backed topic when the user imports the relevant standard. Do not let temporary works dominate the main structural-engineering curriculum, and never confuse BS 5975 guidance with Eurocode material-design checks.

## 5.2 Balance and teaching behaviour

The teaching should blend physical explanation, concise theory, diagrams, calculation, interpretation and transfer practice. A useful lesson often follows this sequence:

1. Establish the real-world situation and learning objective.
2. Ask one focused prediction or reasoning question.
3. Give the learner a chance to answer, without forcing a calculation-heavy response when the objective is conceptual.
4. Diagnose the type of gap from the answer and previous evidence.
5. Offer a graduated hint, a useful sketch, a simplified analogy, or a key principle.
6. If needed, show a step-by-step worked solution that explains why each step is valid.
7. Ask one transfer question with a changed load, support, geometry, material, or wording.
8. Record evidence and schedule a revisit if appropriate.

The tutor must be able to switch between probing questions and direct instruction. Never withhold a needed explanation indefinitely. Do not repeatedly ask the user to explain simple, known content just to simulate Socratic dialogue.

For real-world examples, explain what each member/support does, where the force goes, what idealisations are assumed, and what would alter the result. Use a clean schematic as well as plain-English explanation wherever useful.

## 5.3 Adaptive learner model

Do not rely on a single percentage score. Track evidence at the **learning-objective and misconception level**. At minimum store:

- objective ID and prerequisite IDs;
- evidence records from attempts;
- result/correctness and question difficulty;
- type of task (recall, concept, calculation, diagram interpretation, transfer, design interpretation);
- whether help/hints were used;
- identified misconception/error category;
- learner confidence where volunteered;
- attempt recency and delayed-recall outcomes;
- question/source ID and method used to mark the answer;
- time/fluency only as an optional signal, never as the sole measure of competence.

Use transparent deterministic rules in the first version. Represent states such as **Not assessed**, **Emerging**, **Developing**, **Provisional**, and **Secure** or a similarly clear scale. A topic is not secure based on one easy correct answer. Require evidence across more than one question type and, for important objectives, a later retrieval or transfer check.

When suggesting the next task, use prerequisite weakness, error type, recency, level of challenge and recent evidence. Give the user a concise explanation such as “Recommended because you can calculate reactions but have recently mixed up the shear jump at a point load.” Let the learner override the recommendation.

Possible misconception categories include: incorrect free-body diagram, wrong moment arm, force-component error, sign convention, equilibrium setup, unsupported use of a formula, load segmentation error, reaction error, confusion between external and internal forces, diagram-shape error, algebra/arithmetic, unit/dimension error, section-property interpretation, material-property misunderstanding, code-reference uncertainty, or unknown cause. Keep categories extensible; don't over-diagnose when evidence is insufficient.

## 5.4 Question-bank and content schema

Represent teaching material as validated structured content, not only prose embedded in Python source. Use JSON or another documented local format with schema validation. A question/item should support fields equivalent to:

- unique ID, title, topic/objectives, prerequisite IDs, difficulty and task type;
- original problem statement and diagram specification;
- known inputs, assumptions, units and unknowns;
- answer format and deterministic marking/validation method when possible;
- accepted numerical answer and tolerance, or conceptual rubric;
- step-by-step solution and concise underlying principle;
- graduated hints;
- common wrong answers and associated misconception IDs;
- one or more transfer variations or variation templates;
- source citations and verification status;
- author/source type, version and last-reviewed date.

Validate every content item. Invalid or AI-generated content must never break the application or silently enter the trusted starter bank. AI-generated questions should go into a clearly marked **draft/review queue** until schema validation, numerical verification and source review pass. Keep original educational questions separate from short cited excerpts or source-derived questions.

# 6. Textbook, notes and Eurocode source system

The user will supply multiple textbooks, notes, and relevant standards after the basic app is built. Create the complete workflow for adding and managing them.

## 6.1 Import and metadata

- Let the user choose local PDF files through the GUI. Do not recursively scan their computer or read arbitrary paths without user selection.
- Capture/edit title, author/organisation, edition, publication year, document type (textbook, lecture notes, standard, design guide, personal notes), jurisdiction, standard number/part, revision/status, and notes.
- Preserve the original document path/reference and a stable local document ID.
- Extract selectable text locally. Detect scanned/image-only PDFs and clearly explain that OCR may be needed; do not silently send files to an online OCR service. Offer OCR as a separately documented optional workflow only if it can be supported safely.
- Index text by page and, where practical, headings/sections. Store both PDF page index and printed page number if they differ or can be identified; clearly label uncertain printed pagination.
- Allow re-indexing, updating metadata, removing a source and rebuilding the local index without corrupting other data.
- Show useful progress/error states for large PDFs and handle corrupt, encrypted, duplicate, or unsupported documents gracefully.

## 6.2 Source hierarchy and provenance

The tutor must distinguish:

1. **Supplied standards/codes** as the controlling source when a lesson claims compliance with a particular code edition and jurisdiction.
2. **Supplied textbooks/notes** as the user's chosen instructional/reference sources.
3. **General model knowledge** as supplemental explanation that is not, by itself, proof of what a supplied book or standard says.
4. **Calculated results** from the deterministic Python engine, which must be traced to formula, inputs, units, assumptions and solver version.

Do not assume the most recent edition automatically applies to a real project. Let the user specify which edition, UK National Annex, project basis, and source is authoritative. If the required standard edition or clause is not in the local library, say so. Never invent a clause, page, table, factor, material value, or quote.

For every standard-dependent answer, expose references such as document title, edition/revision, clause/section, table/figure if known, and PDF/printed page when available. If the system can only identify a page, do not fabricate a clause number. If OCR or extraction quality is uncertain, flag the reference for manual verification.

## 6.3 Search and retrieval

Implement local source search, filters by type/topic/document, result snippets, open-at-page behaviour when possible, and a source-details panel. The tutoring layer should retrieve a small, relevant set of passages, then answer grounded in those passages rather than pasting a whole textbook into every request.

If relevant documents disagree, show the disagreement and editions rather than quietly merging them. Standards clauses and textbooks may use different notation or conventions; preserve the source's notation and explain cross-mapping.

Use brief, necessary excerpts only and prefer clear paraphrase with citations. Do not reproduce whole chapters, tables, or large portions of copyrighted textbooks or standards in the UI. Keep local user-supplied documents local. Never transmit the user's library to a remote service by default.

## 6.4 AI answer grounding

Any AI-generated explanation should identify which claims are supported by retrieved source references and which are general explanatory synthesis. A citation is valid only if retrieval actually found the referenced content. Never display a made-up citation to make an answer look authoritative.

If no suitable source is found, the tutor may still explain a basic concept from general knowledge if AI is enabled, but must label it as an unsourced explanation and not as a quoted code requirement. For code-design questions, prefer “source not found—select/import the relevant edition or verify the clause” over invented code precision.

# 7. Deterministic engineering tools

The engineering workbench is an educational calculation and visualisation facility. It must state its assumptions and boundaries. It is **not** a certified design package and must not imply that results are sufficient to approve a real structure.

## 7.1 Unit and dimensional system

Implement a central unit/quantity system (a vetted library such as Pint is acceptable if compatible; otherwise create a small, tested domain wrapper). Do not scatter unit conversions through GUI code.

- Keep an explicit, documented internal unit policy; convert input/output at boundaries.
- Support the common UK structural-engineering units: N, kN, MN; mm, cm, m; area in mm²/cm²/m²; section moduli and first moments in mm³/cm³/m³ as appropriate; second moments of area in mm⁴/cm⁴/m⁴; moments in N·mm, kN·m, etc.; stress/modulus in Pa/MPa/GPa and N/mm²; distributed loads in kN/m and N/mm; and mass/weight where applicable.
- Validate dimensions, not just numeric values. Where a unitless number is required, say so. Show conversions and sensible rounding. Do not silently treat mass as force.
- Include conversion tests and explain why unit powers matter. Important checks include 1 kN = 1000 N, 1 kN·m = 10^6 N·mm, 1 MPa = 1 N/mm², 1 m² = 10^6 mm², 1 m³ = 10^9 mm³ and 1 m⁴ = 10^12 mm⁴.
- Prevent common errors such as adding forces to moments or confusing a section modulus (`length³`) with a second moment of area (`length⁴`).
- Provide a small “units and dimensions” reference/practice module integrated with the learner model.

## 7.2 Section-property calculator

In the initial release, support verified elementary shapes (at least rectangles; add circles/hollow rectangles and more only with tests). For each shape, compute the properties supported by the module and display the reference axis and assumptions:

- cross-sectional area;
- centroid;
- second moment of area about explicitly named axes;
- elastic section modulus where applicable;
- parallel-axis calculations for simple composite sections if implemented and tested.

Show a cross-section diagram with dimensions and centroid/axes. Explain the conceptual meaning in concise, accessible language and show units. Do not call `I` a direct measure of resistance in isolation: distinguish geometry `I`, stiffness `EI`, stress under a given moment, and section modulus. Make formulas inspectable. Flag unsupported sections instead of guessing their properties.

## 7.3 First beam-analysis implementation

Implement a carefully scoped solver for **statically determinate beam cases only**. State that scope clearly in the UI. Do not pretend a simple equilibrium calculator can solve indeterminate beams, frames, or arbitrary finite-element problems.

The initial supported cases should include, as feasible and tested:

- simply supported beams, cantilevers, and simple overhang cases supported by explicit assumptions;
- point loads, multiple point loads, full-span/partial UDLs, linearly varying triangular/trapezoidal distributed loads, and point couples/moments;
- self-weight only when the user explicitly enables/provides the required properties and material/unit assumptions;
- reaction calculation by global equilibrium;
- internal shear and bending moment at positions along the beam;
- SFD and BMD plotting with a documented sign convention, explicit discontinuities, loads/supports, key values and units;
- validation of equilibrium and boundary conditions; display warnings for unsupported configurations.

Build a load-case model rather than calculating directly from unstructured form fields. Validate lengths, load positions, support constraints, sign conventions and load extents before solving. For piecewise loads, preserve discontinuities at point loads and applied couples; don't smooth them out through naive plotting. Include values immediately to either side of jumps where needed.

Every result should display the idealisation, supports, loads, reactions, relevant cut/equilibrium method, assumptions, and independent checks. Numerical results must be reproducible and testable without the AI.

Use property-based or parameterised tests where practical. Tests should cover equilibrium and known analytical cases. Minimum reference tests include:

1. A 6 m simply supported beam with a 12 kN point load at midspan: reactions 6 kN each; maximum sagging moment 18 kN·m at midspan; shear jump of 12 kN at the load under the documented convention.
2. A 5 m simply supported beam with a 4 kN/m full-span UDL: reactions 10 kN each; maximum sagging moment 12.5 kN·m at midspan; shear crosses zero at midspan under the usual convention.
3. A rectangular section of width 100 mm and depth 200 mm: area 20,000 mm²; `I` about its centroidal horizontal axis = approximately 66,666,667 mm⁴; elastic section modulus for bending about that axis = approximately 666,667 mm³.
4. Unit conversion checks listed in §7.1.

If you use a different sign convention, adapt signed expected values but document the convention and preserve the physical magnitudes and checks. Tests must verify more than the final plotted appearance.

## 7.4 Truss/member-force extensions

Design the domain architecture so a future 2D pin-jointed truss solver can be added cleanly. If you implement it in the first release, limit it to documented, tested determinate trusses with clear stability/determinacy checks. Use equilibrium-based results and display tension/compression explicitly. Never imply general frame or FEM analysis support unless such a solver is actually implemented and validated.

## 7.5 Software output interpretation

Include learning content (not necessarily a full importer for structural software files) on interpreting typical analysis output: support reactions, member-end forces, internal forces, deformed shape, stability warnings, load combinations, units, and boundary-condition errors. Emphasise independent checks and the difference between model output and a valid real-world design.

# 8. AI tutor service contract

Make the AI teacher a **replaceable explainer/question designer**, not the authority for structural calculations.

- AI input should include the current learner objective, recent relevant evidence, a concise learner context, retrieved source passages with valid source IDs, and any deterministic calculation results already computed by Python.
- AI output must follow a validated structured schema for lesson text, one next question, hints, source IDs, and optional draft content. Reject or safely handle invalid output.
- Use a controlled tool/action registry for calculations and source lookup. Do not execute arbitrary Python or shell code generated by the model. Do not use `eval` or dynamically execute model output.
- The model may request an approved calculation by structured arguments; Python validates the inputs, executes the known solver, and returns the result. The model then explains it.
- When the learner makes an error, the tutor should identify the likely misconception only when evidence supports it; otherwise ask a clarifying diagnostic question or mark the cause uncertain.
- Never expose hidden chain-of-thought. Provide concise, user-facing reasoning, the relevant principle, assumptions, and checkable calculation steps.
- Avoid long, generic preambles. Be precise, helpful and interactive. Don't end every response with a question if the current task is complete.
- Generate practice questions using controlled templates and verified parameters wherever possible. If the question requires open-ended AI generation, validate its structure, inputs, solution, units, and solver result before presenting it as a scored item. Mark unverified drafts explicitly.
- AI may use its general knowledge to suggest pedagogical analogies and curriculum links, but it must not claim those are present in a textbook unless the source is retrieved and cited.
- Add timeouts, cancellation, safe retries, logging without private source contents, and a clear AI-off path.

## Example of correct tutor behaviour

Learner prompt: “Why does making a rectangular beam deeper usually make it much stiffer in bending?”

Good behaviour: first relate the physical idea to material being placed farther from the neutral axis; explain that for a rectangle the centroidal second moment of area about the horizontal axis scales with depth cubed when width is held constant; then distinguish `I` (geometry), `EI` (elastic flexural rigidity), bending stress, and section modulus. Use a diagram or a small numerical comparison. State the conditions of that comparison (same material, width, span, and boundary/loading assumptions as applicable). Ask one short follow-up that tests transfer rather than presenting a long derivation by default.

Bad behaviour: say merely “because `I = bd³/12`”; imply `I` alone is material strength; or drown the user in a lengthy calculus derivation they did not request.

## Example of correct grounding behaviour

Learner asks: “What does Eurocode 5 require for this timber check?”

Good behaviour: establish which supplied edition and UK National Annex are selected; retrieve the relevant clause/table; identify the exact source and page/section where available; run a checked calculation only when all inputs and rules are available; explicitly identify missing information. If the necessary clause is absent, say that it is not available in the library and do not invent it.

Bad behaviour: fabricate a clause number or factor from memory and present it as verified compliance.

# 9. UX and visual product standard

The first impression should feel like a polished personal engineering study application. Use the app name **StructTutor** unless a stronger name is easily substituted without major work.

Suggested top-level navigation:

- **Home** — continuation, priority actions, recent activity, review queue.
- **Learning Map** — topics, prerequisites, learner-state indicators and why each is recommended.
- **Tutor** — interactive lessons, probing questions, hints, diagrams, calculations, and worked solutions.
- **Practice** — focused practice, mixed review, diagnostic assessment, challenge sets.
- **Engineering Lab** — beam/SFD/BMD tool, section-properties calculator, unit tools.
- **Sources** — imported books/standards/notes, search results and references.
- **Progress** — mastery evidence, retention, misconception trends and plan.
- **Settings** — units, preferences, local AI connection, source management, backup/export.

Requirements:

- A first-run welcome/onboarding sequence that briefly explains local storage, lets the user set basic units/preferences, and offers a diagnostic later (not forced immediately).
- The dashboard should not display fake progress for which there is no evidence.
- Clear distinction between assessed mastery, provisional evidence, untested skills and generated/unverified content.
- Friendly empty states and helpful errors; no “dead” buttons or controls that look active but do nothing.
- Smooth resizable layout and appropriate handling of long source titles, formulae, tables and diagram labels.
- Formulae rendered legibly. Use plain-text fallback or mathematical formatting that works offline. Never allow formula overflow to make an exercise unusable.
- Useful FBD/SFD/BMD and section sketches. Include labels and sign conventions; charts must correspond to solver data rather than illustrative made-up shapes.
- Keyboard navigation and sensible focus order; accessible contrast and labels.
- Confirm destructive actions such as deleting a source or resetting progress.
- Keep the normal learning flow uncluttered. Put advanced details, citations and derivations behind expandable panels so beginners are not overloaded.

# 10. Proposed project architecture

Choose a practical layout similar to this, adapting only when the existing project calls for it. Keep UI, domain logic, storage, source ingestion and AI integration separated.

```text
structtutor/
  pyproject.toml
  README.md
  CHANGELOG.md
  .gitignore
  run_windows.bat
  setup_windows.bat
  src/
    structtutor/
      __init__.py
      __main__.py
      app.py
      config.py
      ui/
        main_window.py
        theme.py
        components/
        pages/
      domain/
        units.py
        quantities.py
        curriculum.py
        learner_model.py
        question_models.py
        load_cases.py
        beam_solver.py
        section_properties.py
        validators.py
      services/
        tutoring_service.py
        adaptive_engine.py
        source_ingestion.py
        source_search.py
        model_provider.py
        ollama_provider.py
        export_service.py
      storage/
        database.py
        repositories.py
        migrations.py
      content/
        schema.json
        starter_curriculum.json
        starter_questions.json
  tests/
    unit/
    integration/
    fixtures/
  docs/
    USER_GUIDE.md
    ARCHITECTURE.md
    ENGINEERING_ASSUMPTIONS.md
    SOURCE_LIBRARY_GUIDE.md
    TEST_REPORT.md
    TROUBLESHOOTING.md
```

Do not force every file into this exact layout if a simpler equivalent is more maintainable. Avoid an overengineered plug-in system. Use type hints, cohesive modules, docstrings for non-obvious calculations, and explicit interfaces. Keep UI code free of engineering formulas. Do not embed the whole question bank in GUI callbacks.

## Database and migrations

Design SQLite tables/relations for at least:

- sources and source metadata;
- page-level extracted text and searchable index;
- curriculum topics/objectives and prerequisite edges;
- questions/content and validation/verification status;
- misconception taxonomy;
- attempts/session history and per-objective evidence;
- learner-state summaries (derivable where reasonable);
- preferences/provider settings (never store credentials that aren't needed);
- saved load cases/calculation runs including inputs, units, assumptions, results, solver version and verification status.

Use schema migrations or an equivalent safe versioning approach. Backups must include the required local data and be restorable. Store file paths carefully; handle missing/moved source files without crashing. Do not store uploaded full PDFs inside the SQLite database unless there is a clear reason; prefer reference paths plus locally extracted text/index.

# 11. Privacy, reliability and engineering safety

- Local-first: no accounts, telemetry, analytics beacons, remote database, or cloud AI by default.
- No internet required for the normal application workflow. If documentation/dependency download needs internet during development, it should not become a runtime dependency.
- Do not send documents to online services, including OCR/embeddings/model APIs, without explicit user consent and a clear explanation of what would be sent.
- Do not silently index the entire filesystem.
- Keep user-owned learning data private. Logging must not dump full textbook passages, personal notes, or all conversation contents by default.
- Validate all user inputs and imported content. Handle file errors, malformed JSON, model timeouts, bad citations, corrupt databases and missing model runtimes gracefully.
- Use safe SQL parameterisation. Never execute arbitrary imported content.
- Never `eval` question text, formula text, or AI output. Mathematical expressions must use explicit supported formula implementations or a safe parser.
- Engineering results must state their scope, assumptions, units, sign convention, and verification status.
- The product is for learning and independent checking, not certification or sign-off. Clearly state that real design decisions must be checked against the applicable standards, project assumptions and professional review. Avoid alarmist disclaimers, but do not imply the app has authority to approve designs.
- Copyright-aware source display: short relevant excerpts only, citations/locations and paraphrase for longer explanations. Never rebuild the source library by copying entire books into generated outputs.

# 12. Testing and acceptance criteria

A polished result requires working behaviour, not merely plausible-looking UI. Build automated tests and run them. If GUI automation is unavailable, test core workflows through integration tests and perform a manual launch/smoke check where the environment permits.

## 12.1 Functional acceptance

- Application starts on Windows with documented steps, even if no local AI runtime is installed.
- First run creates/opens the local database and loads starter content without overwriting existing user data.
- A user can select a topic, start a practice session, answer a question, receive feedback and see an attempt recorded after restarting the app.
- A wrong answer can be recorded with a misconception or uncertainty; a hint and worked solution can be displayed.
- Learner state and next-activity recommendations change from actual evidence and show why a recommendation was made.
- Source PDF import, metadata edit, text extraction/indexing, search, citation display, source removal and missing-file handling work.
- A supported beam model can be entered and generates internally consistent reactions, SFD/BMD and result checks.
- Unsupported structural cases are rejected or marked unsupported clearly; the app does not invent an answer.
- The section-property tool produces tested results with explicit axes and units.
- Unit conversions work and dimensionally invalid combinations are rejected or flagged.
- AI disabled/unavailable causes a graceful fallback, not an application failure.
- If AI is available, source-grounded responses use retrieved source IDs and model failures are caught and displayed helpfully.
- Backup/export and restore are tested on sample data.

## 12.2 Core numerical/learning tests

Include tests for the beam cases, rectangle section properties and unit conversions specified in §7. Test edge cases such as invalid load positions, zero/negative lengths, unsupported support types, duplicate source import, empty PDFs, interrupted extraction, malformed AI schema, source IDs that do not exist, and a missing Ollama endpoint.

Test adaptive rules: one correct answer must not set an important objective to Secure; hints reduce confidence in independent performance appropriately without treating the learner as a failure; strong repeated results on different question types move the state up; delayed retrieval can reinforce or lower confidence as appropriate; not-yet-assessed skills remain distinct from weak skills.

## 12.3 UI quality gate

Inspect all main pages at normal desktop scale and a narrower resizable window. Check that layout remains usable, text and labels do not overlap, plots stay readable, and no placeholder/disabled controls appear to work. If you can take screenshots, use them to inspect and correct the real UI. Do not substitute a design mockup for the running app.

## 12.4 Documentation quality gate

Create a clear README that contains:

- what the app does and intentionally does not do;
- supported environment and verified Python/runtime versions;
- install/setup steps for a personal Windows 10 computer;
- exact run command and a double-click batch-file option;
- how to import textbooks and standards;
- how to enable/disable/configure local AI (optional);
- data locations, privacy properties, backup and restore;
- supported calculation cases and sign conventions;
- known limitations and troubleshooting.

Include `ENGINEERING_ASSUMPTIONS.md` listing the modelling assumptions and boundaries of the first solver. Do not claim support for code design checks until implemented and tested.

# 13. Build strategy and how you should work

Work autonomously in phases, but keep the app runnable after each phase. Do not try to generate the entire project in one enormous untested step.

### Phase 0 — Inspect and plan

1. Inspect the current workspace and available runtime/tooling.
2. Confirm Python version, OS compatibility and available package/test tools.
3. Briefly state the implementation sequence and any assumptions.
4. Identify dependency risks; do not install a large local model.

### Phase 1 — Working foundation

Create the package, launchable PySide6 window, theme/navigation, configuration, SQLite database/migrations, starter curriculum/question models, and a first-run experience. Run the app and tests.

### Phase 2 — Complete one learning vertical slice

Implement topic selection → learning session → question and hint → answer/feedback → stored attempt → progress state → recommended next activity. Seed enough well-designed original content to demonstrate this end-to-end.

### Phase 3 — Engineering Lab

Implement unit conversions/dimensional checks, the tested rectangle property calculator, and the scoped beam analysis engine with SFD/BMD. Add the specified numerical tests before polishing plots. Keep algorithms in the domain layer and use independent checks.

### Phase 4 — Curriculum depth and adaptation

Seed the priority modules, prerequisites, misconception taxonomy, diagnostic task types and spaced/transfer review logic. Ensure statics, load paths, internal forces, and SFD/BMD receive the greatest depth. Avoid filler content or an enormous generic question bank with no validation.

### Phase 5 — Source library

Implement PDF metadata/import, page extraction, local indexing/search, citation display, source references and failure handling. Use synthetic/sample fixtures in tests. Do not invent or embed the user's not-yet-uploaded books.

### Phase 6 — Optional local AI integration

Add the model provider interface, optional Ollama adapter, connection/model check, schema-validated tutor responses and source-grounded generation. The non-AI flow must already function. Do not automatically download a model, send data remotely, or lock the system to Qwen or any single model.

### Phase 7 — Product polish and validation

Refine UI consistency, keyboard/accessibility behaviour, persistence, backups, documentation, Windows scripts, errors and tests. Run all relevant checks. Fix reproducible defects rather than merely listing them.

### Phase 8 — Final verification and handover

Launch the app if the environment allows, exercise the main flows, run the test suite, inspect the UI, and produce a concise handover. Include exact commands executed and real test status. Distinguish tested features from untested/partial ones.

If time/context limits prevent all phases in one run, leave a clean, runnable checkpoint, update the roadmap/README and continue from the actual repository state. Never claim unfinished work is complete. Prioritise a reliable working core over speculative advanced features.

# 14. Engineering and teaching validation examples

Use these as concrete examples of the standard of behaviour expected from the product. They are examples, not a complete curriculum.

## Example A — Conceptual beam question

Prompt: “For a simply supported beam carrying a central point load, predict the support reactions before calculating. What changes if the load moves toward the left support?”

The system should support a diagram-first response, explain symmetry and equilibrium, and create a changed-load follow-up. It should not confuse the value of the applied load with each reaction. Any calculation shown must be independently computed.

## Example B — Load path / triangular bracket

Present a wall-mounted triangular bracket/platform with an external vertical load at an offset and clearly labelled members/supports. The tutor should first explain the idealised load path and ask the learner to predict member action where appropriate; then use FBDs and deterministic statics to calculate forces for a supported idealisation. Include a clear statement about whether joints are assumed pinned or rigid, how wall connections are idealised, and what real connection effects are not modelled. Do not claim a complete real wall-anchor design from a simple truss equilibrium solution.

## Example C — SFD/BMD transfer

Present a beam with an overhang, a partial UDL and a point load. Require the learner to identify regions, calculate reactions, predict diagram shapes, and check values. Once solved, modify one loading/support condition and ask how the result changes. Never use a stored diagram that doesn't match the load case.

## Example D — Section properties

For a rectangle, show how increasing depth changes area, centroidal second moment of area and elastic section modulus when width is held constant. Explain dimensions and units, distinguish `I` from `EI` and from bending resistance, and then extend to a channel/C-section using its actual geometry and axes. Make clear that properties depend on the axis/section orientation.

## Example E — Unit problem

If the learner has a value in kN·m and a section modulus in mm³, detect the mismatch risk in the resulting stress calculation and explain the conversion path. Show units at each material step and verify that the final dimension is stress, not just a plausible number.

# 15. Definition of “done”

The project is done for this release when all of the following are true:

- It is a real, launchable Windows desktop Python app, not only a specification or collection of code snippets.
- The non-AI tutor workflow is usable end to end.
- It has a coherent seeded curriculum and the agreed priority areas.
- At least the initial deterministic engineering tools work and pass their tests.
- The local source library can be used without uploading books to a service.
- Optional local AI is cleanly separated and its absence does not break the app.
- The UI is coherent, polished and usable at normal desktop sizes.
- User data persists locally and can be backed up/restored.
- Tests and documentation accurately describe what is implemented.
- Known limitations are explicit; no unimplemented feature is represented as complete.

# 16. Final operating instructions

Begin now by inspecting the workspace and available runtime. Do not ask the user to repeat requirements already stated here. Do not ask for textbooks before building the import workflow; starter content and local fixtures are sufficient for development. Do not install a model or make external paid-service accounts. Do not return only a plan.

After your initial brief plan, execute the phases in order, keeping the project runnable. Run checks and use test results to guide corrections. Use the available terminal and file tools where permitted. If a real blocker appears, make the smallest reasonable assumption and continue unless proceeding would risk data loss, privacy, or an unsafe engineering claim.

At handover, report:

1. what is actually implemented;
2. the exact files/folders created or changed;
3. the exact tested setup/run commands for Windows;
4. tests that were actually run and their real outcomes;
5. how to import textbooks/standards;
6. how to enable optional local AI later;
7. known limitations and the next best development steps.

**Build StructTutor as a maintainable product, not a demo that merely looks convincing. Correctness, pedagogy, provenance, transparency and a polished usable experience outrank feature count.**
