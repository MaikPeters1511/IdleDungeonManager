<div align="center">
  <img src="public/hero-image.png" alt="Idle Dungeon Manager Hero Image" width="100%">

  # 🏰 Idle Dungeon Manager

  **Verwalte deine Helden, rüste sie mit legendärer Beute aus, heile sie in gefährlichen Kämpfen und steige zu göttlicher Macht auf!**

  [![Angular](https://img.shields.io/badge/Angular-21+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

  [Features](#-hauptmerkmale) • [Tech Stack](#-technologien) • [Installation](#-erste-schritte) • [Gameplay](#-gameplay)

</div>

---

## ✨ Hauptmerkmale

*   **🛡️ Helden-Gilde**: Rekrutiere und trainiere 6 einzigartige Heldenklassen – vom zähen **Krieger** und schlagkräftigen **Magier** bis hin zur unterstützenden **Klerikerin** und dem heiligen **Paladin**.
*   **💔 Dynamisches Kampfsystem (HP & Klassen-Synergien)**: Helden verlieren in Dungeons Lebenspunkte. Kombiniere deine Truppe weise:
    *   *Tanks (Krieger & Paladine)* fangen Schaden ab und reduzieren ihn für Gruppenmitglieder um 50%.
    *   *Heiler (Kleriker)* heilen ihre Gefährten mitten im Kampf.
    *   Besiegte Helden ruhen sich im Gildenhaus aus (`Resting`), um ihre HP zu regenerieren.
*   **⚔️ Ausrüstung & Beutesystem**: Dungeons droppen zufällige Waffen, Rüstungen und Accessoires mit verschiedenen Seltenheitsgraden (*Common, Rare, Epic, Legendary*). Statte deine Helden aus, um ihre Angriffskraft, max. HP oder Gold-/XP-Multiplikatoren massiv zu steigern.
*   **🔑 Boss-Raids & Schlüssel**: Nutze regenerierende *Dungeon-Keys*, um epische Raids wie die *Katakomben der Untoten* oder die *Vulkanische Caldera* zu betreten. Es winken garantierte epische Beute, Edelsteine und kostbare Essenzen.
*   **🌀 Reinkarnation & Relikte (Prestige)**: Setze deine Gilde im Austausch gegen *Essenz* zurück. Kaufe und verbessere damit permanente göttliche Relikte (z. B. *Schwert des Schicksals* für Schaden oder *Chronos Zahnrad* für schnellere Schlüssel-Regeneration).
*   **📈 Strategische Upgrades**: Investiere dein Gold in permanente Gildenverbesserungen wie *Gierige Goblins* oder *Flinke Stiefel*.
*   **🏆 Trophäenraum**: Schalte Errungenschaften frei, um wertvolle Bonus-Ressourcen zu erhalten.
*   **💤 Offline-Fortschritt**: Deine Helden kämpfen weiter und verdienen Gold, auch wenn das Spiel geschlossen ist (bis zu 12 Stunden Offline-Cap).

## 🛠️ Technologien

Dieses Projekt wurde mit modernen, leistungsstarken Webtechnologien entwickelt:

*   **Framework**: [Angular 21](https://angular.io/) (Signal-basierte Reaktivität für Echtzeit-Updates)
*   **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
*   **Icons**: [Lucide Angular](https://lucide.dev/)
*   **Tests**: [Vitest](https://vitest.dev/)
*   **Speicherung**: LocalStorage mit Zustands-Versionierung und Offline-Fortschritt-Berechnung
*   **Tooling**: Angular CLI & Vite

## 📋 Projektstruktur

```text
/
├── src/            # Quellcode der Anwendung
├── public/         # Statische Assets
├── dist/           # Build-Output (nach Build)
├── angular.json    # Angular Projektkonfiguration
├── package.json    # Abhängigkeiten und Skripte
├── tailwind.config.js # Tailwind CSS Konfiguration
├── tsconfig.*      # TypeScript Konfigurationen
└── ...
```

## ⚙️ Skripte

Folgende Skripte sind über `npm run <skript>` verfügbar:

- `start`: Startet den Entwicklungsserver (`ng serve`).
- `build`: Erstellt ein Produktions-Build (`ng build`).
- `watch`: Startet den Build-Prozess im Watch-Modus.
- `test`: Führt Tests mit Vitest aus (`ng test`).

## 🌍 Umgebungsvariablen
<!-- TODO: Dokumentation der benötigten Umgebungsvariablen hinzufügen, falls vorhanden. -->

## 🧪 Tests
Dieses Projekt verwendet [Vitest](https://vitest.dev/) für Unit-Tests.
- `npm test`: Führt die Testsuite aus.

## 🚀 Erste Schritte

### Voraussetzungen

*   [Node.js](https://nodejs.org/) (v18 oder höher)
*   npm (v9 oder höher)

### Installation

1. Klone das Repository:
   ```bash
   git clone https://github.com/MaikPeters1511/IdleDungeonManager.git
   ```

2. Installiere die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Starte den Development-Server:
   ```bash
   npm start
   ```

4. Öffne deinen Browser und gehe zu `http://localhost:4200`

## 🎮 Gameplay & Strategie-Tipps

1.  **Synergien nutzen**: Schicke einen Tank (Warrior/Paladin) und einen Heiler (Cleric) zusammen in schwierige Dungeons. Sie halten sich gegenseitig am Leben und verhindern, dass dein Fortschritt durch einen K.O. unterbrochen wird.
2.  **Rüstungskammer pflegen**: Kontrolliere regelmäßig deine Beute in den Ausrüstungs-Slots deiner Helden. Rüste Schadensverursacher mit starken Waffen aus, Tanks mit HP-Rüstung und Supporter mit Gold-Accessoires.
3.  **Raids timen**: Nutze deine Schlüssel effizient. Lass deine stärksten Helden Raids laufen, um seltene Ausrüstung und die für den Aufstieg benötigten Essenzen zu ergattern.
4.  **Der Aufstiegs-Zyklus**: Wenn deine Helden an ihre Grenzen stoßen, nutze die Reinkarnation im Upgrades-Tab. Die permanenten Relikte machen deinen nächsten Durchlauf um ein Vielfaches schneller und mächtiger!

## 📄 Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` Datei.

---

<div align="center">
  <sub>Erstellt mit ❤️ von [MaikPeters1511](https://github.com/MaikPeters1511)</sub>
</div>
