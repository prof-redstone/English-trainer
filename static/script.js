const defaultLevel = "C1"

const LEVELS = ["B1", "B2", "C1", "C2"];

const EXERCISE_TYPES = [
    "Traduction",
    "Paragraphe",
    "Grammaire"
];

const PRIMARY_THEMES = [
    "Passé composé, imparfait",
    "Futur simple",
    "Conditionnel présent",
    "Subjonctif présent",
    
    "Pronom relatif", //(qui/que/dont/où)
    "Discours indirect",
    "Hypothèses",
    "Idiotismes et expressions courantes"
];


const SECONDARY_THEMES = [
    "accord du participe passé complexe",
    "féminin/pluriel irrégulier",

    "pronoms compléments", //(le/la/les/lui/leur)
    "pronom relatif composé", //(auquel/duquel)
    
    "prépositions de temps", //(depuis/pendant/pour)
    "prépositions de lieu", // (à/dans/en/sur/chez)
    
    "registre formel vs familier",
    "tournure négative renforcée"// (ne...point/guère)
];

const TRANSFORMATIONS = [
  ["Passé composé, imparfait", "Futur simple"],
  ["Passé composé, imparfait", "Conditionnel présent"],
  ["Passé composé, imparfait", "Subjonctif présent"],
  ["Futur simple", "Passé composé, imparfait"],
  ["Conditionnel présent", "Passé composé, imparfait"],
  ["Subjonctif présent", "Passé composé, imparfait"],

  ["Futur simple", "Conditionnel présent"],
  ["Futur simple", "Subjonctif présent"],
  ["Conditionnel présent", "Futur simple"],
  ["Subjonctif présent", "Futur simple"],

  ["Conditionnel présent", "Subjonctif présent"],
  ["Subjonctif présent", "Conditionnel présent"],

  ["Discours indirect", "Discours direct"],
  ["Discours direct", "Discours indirect"],

];


class App {
    constructor() {
        this.container = document.getElementById("exo-container");
        this.settings = {
            type: "translation",
            themeP: "Tout",
            themeS: "Tout",
            themeT: "Tout",
            level: "B1" 
        };
        this.exercises = [];
        this.renderSettings();

        this.updateSettings();
    }

    renderSettings() {
        const settingsContainer = document.querySelector(".settings-container");
        
        settingsContainer.innerHTML = `
            <div class="setting-group">
                <div>
                    <label>Type d'exercice</label>
                    <select id="exerciseType">
                        ${EXERCISE_TYPES.map(t => 
                            `<option value="${t}" ${t == "Traduction" ? 'selected' : ''}>${t}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div>
                    <label>Niveau</label>
                    <select id="level">
                        ${LEVELS.map(lvl => 
                            `<option value="${lvl}" ${lvl == defaultLevel ? 'selected' : ''}>${lvl}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="divThemeP">
                    <label>Thème principal</label>
                    <select id="themeP">
                        <option value="Tout" selected>Tout</option>
                        ${PRIMARY_THEMES.map(theme => 
                            `<option value="${theme}">${theme}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="divThemeS">
                    <label>Thème secondaire</label>
                    <select id="themeS">
                        <option value="Tout" selected>Tout</option>
                        ${SECONDARY_THEMES.map(theme => 
                            `<option value="${theme}">${theme}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="divThemeT">
                    <label>Thème de transformation</label>
                    <select id="themeT">
                        <option value="-1" selected>Tout</option>
                        ${TRANSFORMATIONS.map((theme, index) => 
                            `<option value="${index}">${theme[0]} → ${theme[1]}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <button class="generateBtn">Générer un exercice</button>
        `;
        
        document.getElementById("exerciseType").addEventListener("change", () => this.updateSettings());
        document.getElementById("level").addEventListener("change", () => this.updateSettings());
        document.getElementById("themeP").addEventListener("change", () => this.updateSettings());
        document.getElementById("themeS").addEventListener("change", () => this.updateSettings());
        document.getElementById("themeT").addEventListener("change", () => this.updateSettings());
        document.querySelector("button.generateBtn").addEventListener("click", () => this.generateExercise());
    }

    updateSettings() {
        this.settings.type = document.getElementById("exerciseType").value;
        this.settings.themeP = document.getElementById("themeP").value;
        this.settings.themeS = document.getElementById("themeS").value;
        this.settings.themeT = document.getElementById("themeT").value;
        this.settings.level = document.getElementById("level").value;

        if(this.settings.type == "Traduction" || this.settings.type == "Paragraphe" ){
            document.querySelector(".divThemeT").classList.add('DisplayNone');
            document.querySelector(".divThemeS").classList.remove('DisplayNone');
            document.querySelector(".divThemeP").classList.remove('DisplayNone');
        }
        if(this.settings.type == "Grammaire"){
            document.querySelector(".divThemeT").classList.remove('DisplayNone');
            document.querySelector(".divThemeS").classList.add('DisplayNone');
            document.querySelector(".divThemeP").classList.add('DisplayNone');
        }
    }

    async generateExercise() {
        this.updateSettings();

        const type = this.settings.type;
        const level = this.settings.level;
        const primaryTheme = (this.settings.themeP === "Tout") ? PRIMARY_THEMES[Math.floor(Math.random() * PRIMARY_THEMES.length)] : this.settings.themeP;
        const secondaryTheme = (this.settings.themeS === "Tout") ? SECONDARY_THEMES[Math.floor(Math.random() * SECONDARY_THEMES.length)] : this.settings.themeS;
        const transformationTheme = (this.settings.themeT == -1) ? TRANSFORMATIONS[Math.floor(Math.random() * TRANSFORMATIONS.length)] : TRANSFORMATIONS[this.settings.themeT];

        console.log(transformationTheme)
        
        let exo;        

        if (type === "Traduction") {
            exo = new TranslationExercise(level, primaryTheme, secondaryTheme);
        } else if (type === "Grammaire") {
            exo = new GrammarExercise(level, transformationTheme[0], transformationTheme[1]);
        }else if (type === "Paragraphe"){
            exo = new ParagraphExercise(level, primaryTheme, secondaryTheme);
        }

        this.exercises.push(exo);
        this.container.insertBefore(exo.element, this.container.firstChild);
    }
}



class BaseExercise {
    constructor(type = "generic") {
        this.id = Date.now();
        this.type = type;
        this.element = document.createElement("div");
        this.element.className = "exo";
    }

    remove() {
        this.element.remove();
    }
}


class TranslationExercise extends BaseExercise {
    constructor(level, primaryTheme, secondaryTheme) {
        super("translation");
        this.level = level;
        this.primaryTheme = primaryTheme;
        this.secondaryTheme = secondaryTheme;
        this.french;
        this.userTranslation = "";
        this.correction;
        this.native;
        this.explanation;
        this.render();
        this.generateQuestion();
    }

    render() {
        this.element.innerHTML = `
            <div class="blockText french">
                <div>Phrase à traduire :</div>
                <p class="frenchText"></p>
            </div>

            <div class="blockText">
                <div>Ta traduction :</div>
                <textarea placeholder="Écrivez ici" rows="1"></textarea>
            </div>
            
            <div class="blockText correctionMinimale hide">
                <div>Correction minimale :</div>
                <div class="correctionMinimaleText">Chargement...</div>
            </div>
            <div class="blockText correctionNative hide">
                <div>Traduction native :</div>
                <div class="correctionNativeText" >Chargement...</div>
            </div>
            <div class="blockText correctionExplication hide">
                <div>Explication :</div>
                <div class="correctionExplicationText">Chargement...</div>
            </div>
        `;

        this.input = this.element.querySelector("textarea");
        this.input.disabled = true;

        this.input.addEventListener("input", e => {
            this.userTranslation = e.target.value; 
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        });

        this.input.addEventListener("keydown", e => {
            if (e.key === "Enter" && this.userTranslation.length > 1) {
                this.submit();
            }
        });
    }
 
    async generateQuestion(){
        try {
            this.element.querySelector(".frenchText").innerHTML = "Chargement...";
            this.element.querySelector(".french").classList.add('Loading');
            let wordList = await getRandomWords();

            const prompToGenFrench = 
`Tu es un tuteur français. 
Génère une phrase de 6-18 mots en français sur la vie quotidienne, opinion, voyage...
Niveau visé : ${this.level}
Thème grammatical principal : ${this.primaryTheme}
Thème grammatical secondaire : ${this.secondaryTheme}
Inclus un de ces mots : ${wordList}. 
RÉPONDS UNIQUEMENT PAR LA PHRASE.`;


            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompToGenFrench
                })
            });
            const data = await res.json();
            this.french = data.result

            this.element.querySelector(".frenchText").innerHTML = this.french;
            this.element.querySelector(".french").classList.remove('Loading');
            this.input.disabled = false;
            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

        } catch (error) {
            console.error('Erreur de generation:', error);
        }
           
    }


    async submit() {
        console.log(this.userTranslation)
        this.input.disabled = true;
        this.generateCorrectionMinimal();
    }

    async generateCorrectionMinimal(){
        //this.element.querySelector(".correction").classList.remove('hide');
        this.element.querySelector(".correctionMinimale").classList.remove('hide');
        this.element.querySelector(".correctionMinimale").classList.add('Loading');

        try {
            const promptToCorrect = 
`INSTRUCTIONS :
Tu es un correcteur d'anglais.
Phrase française : "${this.french}"
Traduction utilisateur : "${this.userTranslation}"

Donne UNIQUEMENT la correction minimale (grammaire, orthographe, conjugaison).
Ne change pas la structure ni le style de la phrase utilisateur.
Réponds avec JUSTE la phrase corrigée, rien d'autre.`

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptToCorrect
                })
            });
            const data = await res.json();
            this.correction = data.result

            this.element.querySelector(".correctionMinimaleText").innerHTML = this.correction;
            this.element.querySelector(".correctionMinimale").classList.remove('Loading');

            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

            this.generateNative()
        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

    async generateNative(){
        this.element.querySelector(".correctionNative").classList.remove('hide');
        this.element.querySelector(".correctionNative").classList.add('Loading');

        try {
            const promptToNative = 
`INSTRUCTIONS :
Tu es un correcteur d'anglais expert.

Phrase française : ${this.french}
Traduction utilisateur : ${this.userTranslation}
Correction minimale du professeur : ${this.correction}

Donne UNIQUEMENT la meilleure traduction idiomatique comme l'écrirait un natif anglophone.
Il faut que le sens de la phrase française soit conservé.
Réponds avec JUSTE la phrase native, rien d'autre.`

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptToNative
                })
            });
            const data = await res.json();
            this.native = data.result

            this.element.querySelector(".correctionNativeText").innerHTML = this.native;
            this.element.querySelector(".correctionNative").classList.remove('Loading');
            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

            this.generateExplaination()
        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

    async generateExplaination(){
        this.element.querySelector(".correctionExplication").classList.remove('hide');
        this.element.querySelector(".correctionExplication").classList.add('Loading');

        try {
            const promptToExplain = 
`INSTRUCTIONS :
Tu es un professeur d'anglais.

Phrase française : ${this.french}
Traduction utilisateur : ${this.userTranslation}
Correction minimale du professeur : ${this.correction}
Version native : ${this.native}

Explique brièvement (1-2 phrases max) seulement si nécessaire en français :
- Les erreurs principales de sa traduction, la regle grammatical associée.
- Pourquoi la version native est meilleure.
Répond en français uniquement.
Sois concis et pédagogique.`

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptToExplain
                })
            });
            const data = await res.json();
            this.explanation = data.result

            this.element.querySelector(".correctionExplicationText").innerHTML = this.explanation;
            this.element.querySelector(".correctionExplication").classList.remove('Loading');
            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

}


class ParagraphExercise extends BaseExercise {
    constructor(level, primaryTheme, secondaryTheme) {
        super("paragraph");
        this.level = level;
        this.primaryTheme = primaryTheme;
        this.secondaryTheme = secondaryTheme;
        this.french;
        this.userTranslation = "";
        this.correction;
        this.native;
        this.explanation;
        this.render();
        this.generateQuestion();
    }

    render() {
        this.element.innerHTML = `
            <div class="blockText french">
                <div>Paragraphe à traduire :</div>
                <p class="frenchText"></p>
            </div>

            <div class="blockText">
                <div>Ta traduction :</div>
                <textarea placeholder="Écrivez ici" rows="1"></textarea>
            </div>
            
            <div class="blockText correctionMinimale hide">
                <div>Correction minimale :</div>
                <div class="correctionMinimaleText">Chargement...</div>
            </div>
            <div class="blockText correctionNative hide">
                <div>Traduction native :</div>
                <div class="correctionNativeText" >Chargement...</div>
            </div>
            <div class="blockText correctionExplication hide">
                <div>Explication :</div>
                <div class="correctionExplicationText">Chargement...</div>
            </div>
        `;

        this.input = this.element.querySelector("textarea");
        this.input.disabled = true;

        this.input.addEventListener("input", e => {
            this.userTranslation = e.target.value; 
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        });

        this.input.addEventListener("keydown", e => {
            if (e.key === "Enter" && this.userTranslation.length > 1) {
                this.submit();
            }
        });
    }
 
    async generateQuestion(){
        try {
            this.element.querySelector(".frenchText").innerHTML = "Chargement...";
            this.element.querySelector(".french").classList.add('Loading');
            let wordList = await getRandomWords();

            const prompToGenFrench = 
`Tu es un tuteur français. 
Génère un paragraphe de 30-50 mots en français sur la vie quotidienne, opinion, voyage...
Niveau visé : ${this.level}
Thème grammatical principal : ${this.primaryTheme}
Thème grammatical secondaire : ${this.secondaryTheme}
Inclus un de ces mots : ${wordList}. 
Tu peux inclure d'autre thème grammaticaux, si les premiers sont réalisés.
RÉPONDS UNIQUEMENT PAR LE PARAGRAPHE.`;


            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompToGenFrench
                })
            });
            const data = await res.json();
            this.french = data.result
            
            this.element.querySelector(".frenchText").innerHTML = this.french;
            this.element.querySelector(".french").classList.remove('Loading');
            this.input.disabled = false;

            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

        } catch (error) {
            console.error('Erreur de generation:', error);
        }
           
    }


    async submit() {
        console.log(this.userTranslation)
        this.input.disabled = true;
        this.generateCorrectionMinimal();
    }

    async generateCorrectionMinimal(){
        //this.element.querySelector(".correction").classList.remove('hide');
        this.element.querySelector(".correctionMinimale").classList.remove('hide');
        this.element.querySelector(".correctionMinimale").classList.add('Loading');

        try {
            const promptToCorrect = 
`INSTRUCTIONS :
Tu es un correcteur d'anglais.
Paragraphe français : "${this.french}"
Traduction utilisateur : "${this.userTranslation}"

Donne UNIQUEMENT la correction minimale (grammaire, orthographe, conjugaison).
Ne change pas la structure ni le style du paragraphe de l'utilisateur.
Réponds avec JUSTE le paragraphe corrigée, rien d'autre.`

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptToCorrect
                })
            });
            const data = await res.json();
            this.correction = data.result

            this.element.querySelector(".correctionMinimaleText").innerHTML = this.correction;
            this.element.querySelector(".correctionMinimale").classList.remove('Loading');

            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

            this.generateNative()
        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

    async generateNative(){
        this.element.querySelector(".correctionNative").classList.remove('hide');
        this.element.querySelector(".correctionNative").classList.add('Loading');

        try {
            const promptToNative = 
`INSTRUCTIONS :
Tu es un correcteur d'anglais expert.

Paragraphe français : "${this.french}"
Traduction utilisateur : "${this.userTranslation}"
Correction minimale du professeur : "${this.correction}"

Donne UNIQUEMENT la meilleure traduction idiomatique comme l'écrirait un natif anglophone.
Il faut que le sens du paragraphe français soit conservé.
Réponds avec JUSTE le paragraphe natif, rien d'autre.`

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptToNative
                })
            });
            const data = await res.json();
            this.native = data.result

            this.element.querySelector(".correctionNativeText").innerHTML = this.native;
            this.element.querySelector(".correctionNative").classList.remove('Loading');
            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

            this.generateExplaination()
        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

    async generateExplaination(){
        this.element.querySelector(".correctionExplication").classList.remove('hide');
        this.element.querySelector(".correctionExplication").classList.add('Loading');

        try {
            const promptToExplain = 
`INSTRUCTIONS :
Tu es un professeur d'anglais.

Phrase française : "${this.french}"
Traduction utilisateur : "${this.userTranslation}"
Correction minimale du professeur : "${this.correction}"
Version native : "${this.native}"

Explique brièvement (quelques phrases max) seulement si nécessaire en français :
- Les erreurs principales de sa traduction, la regle grammatical associée.
- Pourquoi la version native est meilleure.
Répond en français uniquement.
Sois concis et pédagogique.`

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptToExplain
                })
            });
            const data = await res.json();
            this.explanation = data.result

            this.element.querySelector(".correctionExplicationText").innerHTML = this.explanation;
            this.element.querySelector(".correctionExplication").classList.remove('Loading');
            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

}

class GrammarExercise extends BaseExercise {
    constructor(level, themeSource, themeTarget) {
        super("grammar");
        this.themeSource = themeSource;
        this.themeTarget = themeTarget;
        this.level = level;

        this.originalSentence = "";
        this.userRewrite = "";
        this.correction = "";
        this.explanation = "";

        this.render();
        this.generateQuestion();
    }

    render() {
        this.element.innerHTML = `
            <div class="blockText english">
                <div>Phrase à transformer :</div>
                <p class="englishText"></p>
            </div>

            <div class="blockText">
                <div>Réécris la phrase selon le thème demandé :</div>
                <p class="themeTarget">Objectif : ${this.themeSource} → ${this.themeTarget}</p>
                <textarea placeholder="Écrivez ici" rows="1"></textarea>
            </div>
            
            <div class="blockText correctionFinale hide">
                <div>Correction :</div>
                <div class="correctionFinaleText">Chargement...</div>
            </div>

            <div class="blockText correctionExplication hide">
                <div>Explication :</div>
                <div class="correctionExplicationText">Chargement...</div>
            </div>
        `;

        this.input = this.element.querySelector("textarea");
        this.input.disabled = true;

        this.input.addEventListener("input", e => {
            this.userRewrite = e.target.value; 
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        });

        this.input.addEventListener("keydown", e => {
            if (e.key === "Enter" && this.userRewrite.length > 1) {
                this.submit();
            }
        });
    }

    async generateQuestion() {
        try {
            this.element.querySelector(".englishText").innerHTML = "Chargement...";
            this.element.querySelector(".english").classList.add('Loading');
            let wordList = await getRandomWords();

            const prompt = 
`Tu es un professeur d'anglais natif.
Génère une phrase de 6-18 mots en anglais sur la vie quotidienne, opinion, voyage...
Niveau visé : ${this.level}
La phrase doit illustrer clairement le thème grammatical suivant : ${this.themeSource}
Inclus un de ces mots : ${wordList} (à traduire en anglais). 
RÉPONDS UNIQUEMENT PAR LA PHRASE.`;

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            this.originalSentence = data.result;
            this.element.querySelector(".englishText").innerHTML = this.originalSentence;
            this.element.querySelector(".english").classList.remove('Loading');
            this.input.disabled = false;

            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

        } catch (err) {
            console.error("Erreur génération phrase:", err);
        }
    }

    async submit() {
        this.input.disabled = true;
        this.generateCorrection();
    }

    async generateCorrection() {
        this.element.querySelector(".correctionFinale").classList.remove("hide");
        this.element.querySelector(".correctionFinale").classList.add("Loading");

        try {
            const prompt = 
`INSTRUCTIONS :
Tu es un correcteur d'anglais expert.
Phrase de départ (thème : ${this.themeSource}) :
"${this.originalSentence}"
Réécriture de l'utilisateur (objectif : ${this.themeTarget}) :
"${this.userRewrite}"
TÂCHE :
Fournis la meilleure version correcte et naturelle de la phrase,
respectant précisément le thème cible : **${this.themeTarget}**.
Préserve le sens original.
Réponds uniquement par la phrase corrigée.`;

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            this.correction = data.result;
            this.element.querySelector(".correctionFinaleText").innerHTML = this.correction;
            this.element.querySelector(".correctionFinale").classList.remove("Loading");

            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

            this.generateExplanation();

        } catch (err) {
            console.error("Erreur correction:", err);
        }
    }

    async generateExplanation() {
        this.element.querySelector(".correctionExplication").classList.remove('hide');
        this.element.querySelector(".correctionExplication").classList.add('Loading');

        try {
            const prompt = 
`Tu es un professeur d'anglais.
Explique brièvement (1-2 phrases maximum) :
Phrase orignal : "${this.originalSentence}"
Traduction étudiante : "${this.userRewrite}"
L'étudiant devait traduire dans le thème : "${this.themeTarget}"
Correction du professeur : "${this.correction}"

Explique brièvement (quelques phrases max) seulement si nécessaire en français :
- Les erreurs principales de sa traduction, la regle grammatical associée.
- Pourquoi la correction est meilleure.
Répond en français uniquement.
Sois concis et pédagogique.`;

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            this.explanation = data.result;
            this.element.querySelector(".correctionExplicationText").innerHTML = this.explanation;
            this.element.querySelector(".correctionExplication").classList.remove("Loading");
            
            if(data.result == ""){ this.element.innerHTML = renderErrorMSG(); return}

        } catch (err) {
            console.error("Erreur explication:", err);
        }
    }
}

function renderErrorMSG(){
    return `
            <div class="blockText">
                <div>Une erreur s'est produite !</div>
                <p class="">Essayez de regénérer un exercice. Si l'erreur persiste, essayez de relancer le serveur.</p>
            </div>
        `;
}

//Pour generer des phrases aléatoire 
async function getRandomWords(url = '/static/word.txt', count = 5) {
  const response = await fetch(url);
  const text = await response.text();

  const words = text.split(/\r?\n/).filter(line => line.trim() !== '');

  const shuffled = words.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

const app = new App();