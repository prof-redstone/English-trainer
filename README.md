# English Trainer

Application web d'entraînement à la traduction français-anglais utilisant un modèle LLM local via Ollama.

## Prérequis

- Python 3.x
- [Ollama](https://ollama.ai/) installé
- Flask (`pip install flask`)
- Un modèle Ollama (par défaut : `qwen2.5:14b`)

## Installation

1. Cloner le dépôt
2. Installer les dépendances :
   ```bash
   pip install flask
   ```
3. Installer Ollama et télécharger le modèle :
   ```bash
   ollama pull qwen2.5:14b
   ```

## Lancement

```bash
python app.py
```

L'application s'ouvre automatiquement dans le navigateur sur `http://localhost:5000`

## Fonctionnalités

- **Génération de phrases** : Phrases françaises générées selon un niveau (B1-C2) et des thèmes grammaticaux
- **Correction progressive** :
  - Correction minimale (grammaire/orthographe)
  - Traduction native idiomatique
  - Explications pédagogiques
- **Personnalisation** : Choix du niveau, thème principal et secondaire

## Utilisation

1. Sélectionner le niveau et les thèmes souhaités
2. Cliquer sur "Générer un exercice"
3. Traduire la phrase française en anglais
4. Consulter les corrections et explications

## Notes

- Les réponses du LLM peuvent varier en qualité selon le modèle utilisé
- L'application nécessite une connexion à Ollama en local