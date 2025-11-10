const defaultLevel = "B2"

const LEVELS = ["B1", "B2", "C1", "C2"];

const EXERCISE_TYPES = [
    { value: "translation", label: "Traduction" },
    { value: "grammaire", label: "Grammaire" }
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


class App {
    constructor() {
        this.container = document.getElementById("exo-container");
        this.settings = {
            type: "translation",
            themeP: "Tout",
            themeS: "Tout",
            level: "B1" 
        };
        this.exercises = [];
        this.renderSettings();
    }

    renderSettings() {
        const settingsContainer = document.querySelector(".settings-container");
        
        settingsContainer.innerHTML = `
            <div class="setting-group">
                <div>
                    <label>Type d'exercice</label>
                    <select id="exerciseType">
                        ${EXERCISE_TYPES.map(t => 
                            `<option value="${t.value}" ${t.value === 'translation' ? 'selected' : ''}>${t.label}</option>`
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

                <div>
                    <label>Thème principal</label>
                    <select id="themeP">
                        <option value="Tout" selected>Tout</option>
                        ${PRIMARY_THEMES.map(theme => 
                            `<option value="${theme}">${theme}</option>`
                        ).join('')}
                    </select>
                </div>

                <div>
                    <label>Thème secondaire</label>
                    <select id="themeS">
                        <option value="Tout" selected>Tout</option>
                        ${SECONDARY_THEMES.map(theme => 
                            `<option value="${theme}">${theme}</option>`
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
        document.querySelector("button.generateBtn").addEventListener("click", () => this.generateExercise());
    }

    updateSettings() {
        this.settings.type = document.getElementById("exerciseType").value;
        this.settings.themeP = document.getElementById("themeP").value;
        this.settings.themeS = document.getElementById("themeS").value;
        this.settings.level = document.getElementById("level").value;
    }

    async generateExercise() {
        this.updateSettings();

        const type = this.settings.type;
        const level = this.settings.level;
        const primaryTheme = (this.settings.themeP === "Tout") ? PRIMARY_THEMES[Math.floor(Math.random() * PRIMARY_THEMES.length)] : this.settings.themeP;
        const secondaryTheme = (this.settings.themeS === "Tout") ? SECONDARY_THEMES[Math.floor(Math.random() * SECONDARY_THEMES.length)] : this.settings.themeS;
        
        let exo;        

        if (type === "translation") {
            exo = new TranslationExercise(level, primaryTheme, secondaryTheme);
        } else if (type === "grammaire") {
            exo = new GrammarExercise();
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

            const prompToGenTemp = 
                `INSTRUCTIONS (FRANÇAIS) :
                - Ton rôle : tuteur qui fournit des phrases EN FRANÇAIS uniquement.
                - Répondre STRICTEMENT par une seule phrase en français.
                - Ne rien ajouter : pas d'introduction, pas de commentaire.
                - Varie la difficulté et les thèmes (quotidien, opinion, voyage, nourriture, hobby).
                - Utiliser présent, futur, passé, conditionnel, subjonctif, etc.
                - Longueur : 6 à 18 mots environ.
                - IMPORTANT : Utilise juste un de ces mots : ${wordList}
                Réponds maintenant par UNE SEULE PHRASE EN FRANÇAIS qui fait du sens.`

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
                Phrase française : ${this.french}
                Traduction utilisateur : ${this.userTranslation}

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
        } catch (error) {
            console.error('Erreur de generation:', error);
        }
    }

}

class GrammarExercise extends BaseExercise {
    constructor(data) {
        super("grammaire");
        this.question = data.question;
        this.options = data.options || [];
        this.correctIndex = data.correctIndex ?? 0;
        this.userAnswer = null;
        this.resultShown = false;
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="exo-header">
                <div>Question de grammaire :</div>
                <p>${this.question}</p>
            </div>
            <div class="exo-body">
                ${this.options.map((opt, i) => `
                    <button class="option-btn" data-index="${i}">${opt}</button>
                `).join("")}
                <div class="result"></div>
            </div>
        `;

        this.element.querySelectorAll(".option-btn").forEach(btn => {
            btn.addEventListener("click", () => this.selectOption(btn));
        });
    }

    selectOption(btn) {
        if (this.resultShown) return;

        const index = Number(btn.dataset.index);
        this.userAnswer = index;
        this.resultShown = true;

        const result = this.element.querySelector(".result");
        if (index === this.correctIndex) {
            result.innerHTML = `<div class="good">✅ Bonne réponse !</div>`;
        } else {
            result.innerHTML = `<div class="bad">❌ Mauvaise réponse. La bonne était : ${this.options[this.correctIndex]}</div>`;
        }

        this.element.querySelectorAll(".option-btn").forEach(b => {
            b.disabled = true;
            if (Number(b.dataset.index) === this.correctIndex) b.classList.add("correct");
            else if (b === btn) b.classList.add("wrong");
        });
    }
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