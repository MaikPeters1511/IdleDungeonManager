import { Injectable, computed, inject } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly gameService = inject(GameService);

  // Expose reactive language signal
  public readonly language = computed(() => this.gameService.language());

  private readonly translations: Record<string, Record<'de' | 'en', string>> = {
    // Sidebar / Resources
    'Gold': { de: 'Gold', en: 'Gold' },
    'Gems': { de: 'Edelsteine', en: 'Gems' },
    'Keys': { de: 'Schlüssel', en: 'Keys' },
    'Essence': { de: 'Essenz', en: 'Essence' },
    'Scrap': { de: 'Altmetall', en: 'Scrap' },
    'Dashboard': { de: 'Dashboard', en: 'Dashboard' },
    'Heroes Guild': { de: 'Heldengilde', en: 'Heroes Guild' },
    'Dungeons': { de: 'Dungeons', en: 'Dungeons' },
    'Gilden-Werkstatt': { de: 'Gilden-Werkstatt', en: 'Guild Workshop' },
    'Upgrades': { de: 'Upgrades', en: 'Upgrades' },
    'Quests': { de: 'Aufträge', en: 'Quests' },
    'Trophy Room': { de: 'Trophäenraum', en: 'Trophy Room' },
    'Settings': { de: 'Einstellungen', en: 'Settings' },

    // Settings
    'Manage your progress and preferences.': { de: 'Verwalte deinen Fortschritt und deine Einstellungen.', en: 'Manage your progress and preferences.' },
    'Save Management': { de: 'Speicherverwaltung', en: 'Save Management' },
    'Your progress is automatically saved every 30 seconds to your local storage.': { de: 'Dein Fortschritt wird alle 30 Sekunden automatisch lokal gespeichert.', en: 'Your progress is automatically saved every 30 seconds to your local storage.' },
    'Manual Save': { de: 'Manuell Speichern', en: 'Manual Save' },
    'Hard Reset': { de: 'Spiel zurücksetzen', en: 'Hard Reset' },
    'Game Info': { de: 'Spielinfo', en: 'Game Info' },
    'Version': { de: 'Version', en: 'Version' },
    'Engine': { de: 'Engine', en: 'Engine' },
    'Developer': { de: 'Entwickler', en: 'Developer' },
    'Language': { de: 'Sprache', en: 'Language' },
    'Language / Sprache': { de: 'Sprache / Language', en: 'Language / Sprache' },
    'Choose your preferred language.': { de: 'Wähle deine bevorzugte Sprache.', en: 'Choose your preferred language.' },
    'German (Deutsch)': { de: 'Deutsch (German)', en: 'German (Deutsch)' },
    'English (English)': { de: 'Englisch (English)', en: 'English (English)' },
    'Language changed successfully!': { de: 'Sprache erfolgreich geändert!', en: 'Language changed successfully!' },

    // Dashboard
    'Guild Headquarters': { de: 'Gilden-Hauptquartier', en: 'Guild Headquarters' },
    'Your guild is growing stronger every second.': { de: 'Deine Gilde wird jede Sekunde stärker.', en: 'Your guild is growing stronger every second.' },
    'COLLECT GOLD': { de: 'GOLD SAMMELN', en: 'COLLECT GOLD' },
    'Efficiency Rate': { de: 'Effizienzrate', en: 'Efficiency Rate' },
    'Active': { de: 'Aktiv', en: 'Active' },
    'Total Wealth': { de: 'Gesamtvermögen', en: 'Total Wealth' },
    'Total Gold Collected': { de: 'Gesammeltes Gold insgesamt', en: 'Total Gold Collected' },
    'Conquests': { de: 'Eroberungen', en: 'Conquests' },
    'Total Dungeons Cleared': { de: 'Dungeons insgesamt abgeschlossen', en: 'Total Dungeons Cleared' },
    'Deployed Squad': { de: 'Entsandte Truppe', en: 'Deployed Squad' },
    'Heroes currently farming': { de: 'Helden aktiv am Farmen', en: 'Heroes currently farming' },
    'Revenue Flow': { de: 'Einnahmenfluss', en: 'Revenue Flow' },
    'Average Gold per Second': { de: 'Durchschnittliches Gold pro Sekunde', en: 'Average Gold per Second' },
    'Active Hero Missions': { de: 'Aktive Helden-Missionen', en: 'Active Hero Missions' },
    'Active Hero missions': { de: 'Aktive Helden-Missionen', en: 'Active Hero missions' },
    'Manage All': { de: 'Alle verwalten', en: 'Manage All' },
    'MISSION PROGRESS': { de: 'MISSIONS-FORTSCHRITT', en: 'MISSION PROGRESS' },
    'HERO HP': { de: 'HELDEN HP', en: 'HERO HP' },
    'The Guild is Quiet': { de: 'Die Gilde ruht', en: 'The Guild is Quiet' },
    'No heroes are currently assigned to dungeons. Head over to the Heroes Guild to deploy your warriors.': {
      de: 'Derzeit sind keine Helden Dungeons zugewiesen. Besuche die Heldengilde, um deine Krieger auszusenden.',
      en: 'No heroes are currently assigned to dungeons. Head over to the Heroes Guild to deploy your warriors.'
    },
    'Hire Heroes': { de: 'Helden rekrutieren', en: 'Hire Heroes' },
    'Resting Guild Members': { de: 'Ausruhende Helden', en: 'Resting Guild Members' },
    '💤 Resting': { de: '💤 Erholt sich', en: '💤 Resting' },
    'Guild Updates': { de: 'Gilden-Berichte', en: 'Guild Updates' },
    'Pro Tip': { de: 'Profi-Tipp', en: 'Pro Tip' },
    'Deploy a': { de: 'Setze einen', en: 'Deploy a' },
    '(like Elena) and a': { de: '(wie Elena) und einen', en: '(like Elena) and a' },
    'Tank': { de: 'Tank', en: 'Tank' },
    'in difficult dungeons to keep your heroes alive!': {
      de: 'in schwierigen Dungeons ein, um deine Helden am Leben zu erhalten!',
      en: 'in difficult dungeons to keep your heroes alive!'
    },
    'Guild Overview': { de: 'Gilden-Übersicht', en: 'Guild Overview' },
    'Active Heroes on Missions': { de: 'Aktive Helden auf Mission', en: 'Active Heroes on Missions' },
    'No heroes on mission. Send them to dungeons!': { de: 'Keine Helden auf Mission. Sende sie in Dungeons!', en: 'No heroes on mission. Send them to dungeons!' },
    'Idle Guild Members': { de: 'Untätige Gildenmitglieder', en: 'Idle Guild Members' },
    'Resting': { de: 'Ruht sich aus', en: 'Resting' },
    'Ready for adventure': { de: 'Bereit für Abenteuer', en: 'Ready for adventure' },
    'Guild Stats': { de: 'Gilden-Statistiken', en: 'Guild Stats' },
    'Clicks': { de: 'Klicks', en: 'Clicks' },
    'Gold Earned': { de: 'Erhaltenes Gold', en: 'Gold Earned' },
    'Dungeons Completed': { de: 'Abgeschlossene Dungeons', en: 'Dungeons Completed' },
    'Total Hero Levels': { de: 'Gesamtlevel der Helden', en: 'Total Hero Levels' },
    'Power': { de: 'Macht', en: 'Power' },

    // Heroes
    'Manage and upgrade your heroes.': { de: 'Verwalte und verbessere deine Helden.', en: 'Manage and upgrade your heroes.' },
    'Level': { de: 'Stufe', en: 'Level' },
    'Damage': { de: 'Schaden', en: 'Damage' },
    'Attack Speed': { de: 'Tempo', en: 'Attack Speed' },
    'Equipment': { de: 'Ausrüstung', en: 'Equipment' },
    'Equipped': { de: 'Ausgerüstet', en: 'Equipped' },
    'Weapon': { de: 'Waffe', en: 'Weapon' },
    'Armor': { de: 'Rüstung', en: 'Armor' },
    'Accessory': { de: 'Accessoire', en: 'Accessory' },
    'Class Skill': { de: 'Klassenfähigkeit', en: 'Class Skill' },
    'Upgrade': { de: 'Verbessern', en: 'Upgrade' },
    'Locked': { de: 'Gesperrt', en: 'Locked' },
    'Unlock': { de: 'Freischalten', en: 'Unlock' },
    'Equip Item': { de: 'Ausrüstung anlegen', en: 'Equip Item' },
    'No matching items in inventory.': { de: 'Keine passenden Items im Inventar.', en: 'No matching items in inventory.' },
    'Unequip': { de: 'Ablegen', en: 'Unequip' },
    'Empty': { de: 'Leer', en: 'Empty' },

    // Dungeons
    'Dungeon Selection': { de: 'Dungeon-Auswahl', en: 'Dungeon Selection' },
    'Send your heroes to dungeons for gold and loot.': { de: 'Sende deine Helden in Dungeons für Gold und Beute.', en: 'Send your heroes to dungeons for gold and loot.' },
    'Danger': { de: 'Gefahr', en: 'Danger' },
    'Duration': { de: 'Dauer', en: 'Duration' },
    'Rewards': { de: 'Belohnungen', en: 'Rewards' },
    'Loot Chance': { de: 'Beutechance', en: 'Loot Chance' },
    'Modifier': { de: 'Modifikator', en: 'Modifier' },
    'Expires in': { de: 'Läuft ab in', en: 'Expires in' },
    'Raid Boss': { de: 'Raid-Boss', en: 'Raid Boss' },
    'Key Required': { de: 'Schlüssel erforderlich', en: 'Key Required' },
    'Assign Heroes': { de: 'Helden zuweisen', en: 'Assign Heroes' },
    'Start': { de: 'Starten', en: 'Start' },
    'Cancel': { de: 'Abbrechen', en: 'Cancel' },
    'Active Dungeon': { de: 'Aktiver Dungeon', en: 'Active Dungeon' },
    'Completed!': { de: 'Abgeschlossen!', en: 'Completed!' },
    'Dungeon completed!': { de: 'Dungeon abgeschlossen!', en: 'Dungeon completed!' },

    // Workshop
    'Forge powerful equipment and brew alchemical elixirs.': { de: 'Schmiede mächtige Ausrüstung und braue alchemistische Elixiere.', en: 'Forge powerful equipment and brew alchemical elixirs.' },
    'Forge': { de: 'Schmiede', en: 'Forge' },
    'Alchemy Lab': { de: 'Alchemielabor', en: 'Alchemy Lab' },
    'Upgrade Equipment': { de: 'Ausrüstung verbessern', en: 'Upgrade Equipment' },
    'Upgrade your loot with scrap metal.': { de: 'Verbessere deine Beute mit Altmetall.', en: 'Upgrade your loot with scrap metal.' },
    'Select an item to upgrade.': { de: 'Wähle ein Item zum Verbessern aus.', en: 'Select an item to upgrade.' },
    'Combine Items': { de: 'Items kombinieren', en: 'Combine Items' },
    'Fuse two identical items for higher rarity.': { de: 'Verschmelze zwei gleiche Items für eine höhere Seltenheit.', en: 'Fuse two identical items for higher rarity.' },
    'Item Dismantling': { de: 'Item zerschreddern', en: 'Item Dismantling' },
    'Scrap unused loot into scrap metal.': { de: 'Zerschreddere ungenutzte Beute zu Altmetall.', en: 'Scrap unused loot into scrap metal.' },
    'Brew Elixirs': { de: 'Elixiere brauen', en: 'Brew Elixirs' },
    'Spend gold and gems for buffs.': { de: 'Verbrauche Gold und Edelsteine für Buffs.', en: 'Spend gold and gems for buffs.' },
    'Potion': { de: 'Trank', en: 'Potion' },
    'Active Buffs': { de: 'Aktive Buffs', en: 'Active Buffs' },
    'Gem Healing': { de: 'Edelstein-Heilung', en: 'Gem Healing' },
    'Heal injured heroes instantly for 5 gems.': { de: 'Heile verletzte Helden sofort für 5 Edelsteine.', en: 'Heal injured heroes instantly for 5 gems.' },
    'Heal': { de: 'Heilen', en: 'Heal' },
    'Select items to combine': { de: 'Items zum Kombinieren auswählen', en: 'Select items to combine' },
    'Combine': { de: 'Kombinieren', en: 'Combine' },
    'Dismantle': { de: 'Zerschreddern', en: 'Dismantle' },
    'Brew': { de: 'Brauen', en: 'Brew' },
    'Cost': { de: 'Kosten', en: 'Cost' },
    'Owned': { de: 'Besitzt', en: 'Owned' },
    'Inventory': { de: 'Inventar', en: 'Inventory' },
    'Dismantle All Common': { de: 'Alle gewöhnlichen zerschreddern', en: 'Dismantle All Common' },
    'Items combined successfully!': { de: 'Gegenstände erfolgreich kombiniert!', en: 'Items combined successfully!' },
    'Item upgraded successfully!': { de: 'Ausrüstung erfolgreich verbessert!', en: 'Item upgraded successfully!' },
    'Dismantled successfully!': { de: 'Erfolgreich zerschreddert!', en: 'Dismantled successfully!' },
    'All common items dismantled!': { de: 'Alle gewöhnlichen Gegenstände zerschreddert!', en: 'All common items dismantled!' },
    'Potion brewed successfully!': { de: 'Trank erfolgreich gebraut!', en: 'Potion brewed successfully!' },
    'Heroes healed successfully!': { de: 'Helden erfolgreich geheilt!', en: 'Heroes healed successfully!' },
    'Search items...': { de: 'Gegenstände suchen...', en: 'Search items...' },
    'All Slots': { de: 'Alle Slots', en: 'All Slots' },
    'Newest': { de: 'Neueste zuerst', en: 'Newest' },
    'Rarity: High to Low': { de: 'Seltenheit: Hoch zu Niedrig', en: 'Rarity: High to Low' },
    'Rarity: Low to High': { de: 'Seltenheit: Niedrig zu Hoch', en: 'Rarity: Low to High' },
    'Level: High to Low': { de: 'Stufe: Hoch zu Niedrig', en: 'Level: High to Low' },
    'Level: Low to High': { de: 'Stufe: Niedrig zu Hoch', en: 'Level: Low to High' },
    'Loading more items...': { de: 'Lade weitere Gegenstände...', en: 'Loading more items...' },
    'High Rarity': { de: 'Hohe Seltenheit', en: 'High Rarity' },
    'Low Rarity': { de: 'Niedrige Seltenheit', en: 'Low Rarity' },
    'High Level': { de: 'Hohe Stufe', en: 'High Level' },
    'Low Level': { de: 'Niedrige Stufe', en: 'Low Level' },
    'Recall': { de: 'Abbrechen', en: 'Cancel' },
    'Click to recall': { de: 'Klicken zum Abbrechen', en: 'Click to cancel' },

    // Upgrades & Ascension
    'Guild Upgrades & Ascension': { de: 'Gilden-Upgrades & Aufstieg', en: 'Guild Upgrades & Ascension' },
    'Improve your guild or ascend for powerful relics.': { de: 'Verbessere deine Gilde oder steige auf für mächtige Relikte.', en: 'Improve your guild or ascend for powerful relics.' },
    'Guild Upgrades': { de: 'Gilden-Upgrades', en: 'Guild Upgrades' },
    'Relics & Ascension': { de: 'Relikte & Aufstieg', en: 'Relics & Ascension' },
    'Guild Quarters Upgrades': { de: 'Gilden-Quartier Upgrades', en: 'Guild Quarters Upgrades' },
    'Permanent bonuses for your entire guild.': { de: 'Dauerhafte Boni für deine gesamte Gilde.', en: 'Permanent bonuses for your entire guild.' },
    'Prestige Portal (Ascension)': { de: 'Prestige-Portal (Aufstieg)', en: 'Prestige Portal (Ascension)' },
    'Reset your progress for Essence. Relics are kept, other progress is reset.': { de: 'Setze deinen Fortschritt zurück für Essenz. Relikte bleiben erhalten, anderer Fortschritt wird zurückgesetzt.', en: 'Reset your progress for Essence. Relics are kept, other progress is reset.' },
    'Ascend for': { de: 'Aufsteigen für', en: 'Ascend for' },
    'Ancient Relics': { de: 'Antike Relikte', en: 'Ancient Relics' },
    'Spend essence for legendary artifacts.': { de: 'Verbrauche Essenz für legendäre Artefakte.', en: 'Spend essence for legendary artifacts.' },
    'Ascend': { de: 'Aufsteigen', en: 'Ascend' },
    'Buy': { de: 'Kaufen', en: 'Buy' },

    // Quests
    'Guild Quests': { de: 'Gilden-Aufträge', en: 'Guild Quests' },
    'Complete tasks for gold and gems.': { de: 'Schließe Aufgaben ab für Gold und Edelsteine.', en: 'Complete tasks for gold and gems.' },
    'Progress': { de: 'Fortschritt', en: 'Progress' },
    'Claim': { de: 'Einsammeln', en: 'Claim' },
    'Completed': { de: 'Abgeschlossen', en: 'Completed' },
    'Reward': { de: 'Belohnung', en: 'Reward' },

    // Achievements
    'Your master achievements and milestones.': { de: 'Deine meisterhaften Leistungen und Meilensteine.', en: 'Your master achievements and milestones.' },

    // Classes
    'Warrior': { de: 'Krieger', en: 'Warrior' },
    'Mage': { de: 'Magier', en: 'Mage' },
    'Rogue': { de: 'Schurke', en: 'Rogue' },
    'Cleric': { de: 'Kleriker', en: 'Cleric' },
    'Paladin': { de: 'Paladin', en: 'Paladin' },
    'Archer': { de: 'Waldläufer', en: 'Archer' },

    // Rarities
    'Common': { de: 'Gewöhnlich', en: 'Common' },
    'Rare': { de: 'Selten', en: 'Rare' },
    'Epic': { de: 'Episch', en: 'Epic' },
    'Legendary': { de: 'Legendär', en: 'Legendary' },

    // Slots

    // Hero Skills and names
    'Taunt (🛡️ Spott)': { de: '🛡️ Spott', en: '🛡️ Taunt' },
    'Meteor Strike (☄️ Meteor)': { de: '☄️ Meteorhagel', en: '☄️ Meteor Strike' },
    'Assassinate (🗡️ Meucheln)': { de: '🗡️ Meucheln', en: '🗡️ Assassinate' },
    'Resurrection (👼 Wiederbelebung)': { de: '👼 Wiederbelebung', en: '👼 Resurrection' },
    'Aura of Protection (🛡️ Schutz-Aura)': { de: '🛡️ Schutz-Aura', en: '🛡️ Protection Aura' },
    'Critical Strike (🎯 Volltreffer)': { de: '🎯 Volltreffer', en: '🎯 Critical Strike' },
    'Gilde-Training': { de: 'Gilden-Training', en: 'Guild Training' },

    // Hero Skill Descriptions
    'Alaric nimmt allen Schaden von Mitstreitern im selben Dungeon auf sich (reduziert um 20% Block).': {
      de: 'Alaric nimmt allen Schaden von Mitstreitern im selben Dungeon auf sich (reduziert um 20% Block).',
      en: 'Alaric redirects all damage from allies in the same dungeon to himself (reduced by 20% block).'
    },
    'Zephyr hat eine Chance von 15% pro Sekunde, den Dungeon-Fortschritt um 1.5 Sekunden zu beschleunigen.': {
      de: 'Zephyr hat eine Chance von 15% pro Sekunde, den Dungeon-Fortschritt um 1.5 Sekunden zu beschleunigen.',
      en: 'Zephyr has a 15% chance per second to speed up dungeon progress by 1.5 seconds.'
    },
    'Shadow hat eine Chance von 3% pro Sekunde, den Dungeon-Lauf sofort erfolgreich abzuschließen.': {
      de: 'Shadow hat eine Chance von 3% pro Sekunde, den Dungeon-Lauf sofort erfolgreich abzuschließen.',
      en: 'Shadow has a 3% chance per second to immediately complete the dungeon run.'
    },
    'Elena rettet gefallene Helden im Dungeon einmal pro Minute vor dem K.O. und belebt sie mit 30% HP wieder.': {
      de: 'Elena rettet gefallene Helden im Dungeon einmal pro Minute vor dem K.O. und belebt sie mit 30% HP wieder.',
      en: 'Elena rescues fallen heroes in the dungeon from K.O. once per minute and revives them with 30% HP.'
    },
    'Valerius schützt alle Gefährten im selben Dungeon und verringert deren erlittenen Schaden permanent um 25%.': {
      de: 'Valerius schützt alle Gefährten im selben Dungeon und verringert deren erlittenen Schaden permanent um 25%.',
      en: 'Valerius protects all allies in the same dungeon and permanently reduces their damage taken by 25%.'
    },
    'Liraels präziser Bogenkampf verringert die Durchlaufzeit ihrer Dungeons dauerhaft um 25%.': {
      de: 'Liraels präziser Bogenkampf verringert die Durchlaufzeit ihrer Dungeons dauerhaft um 25%.',
      en: 'Lirael\'s precise archery permanently reduces her dungeon run time by 25%.'
    },
    'Gibt passive Boni im Kampf.': {
      de: 'Gibt passive Boni im Kampf.',
      en: 'Grants passive combat bonuses.'
    },

    // Dungeons Dynamic Names & Modifiers
    'Goblin Cave': { de: 'Goblin-Höhle', en: 'Goblin Cave' },
    'Haunted Crypt': { de: 'Heimgesuchte Krypta', en: 'Haunted Crypt' },
    'Undead Catacombs (Raid)': { de: 'Untote Katakomben (Raid)', en: 'Undead Catacombs (Raid)' },
    'Orc Fortress': { de: 'Ork-Festung', en: 'Orc Fortress' },
    'Dragon Lair': { de: 'Drachenhort', en: 'Dragon Lair' },
    'Volcanic Caldera (Raid)': { de: 'Vulkanische Caldera (Raid)', en: 'Volcanic Caldera (Raid)' },
    'Abyssal Gate': { de: 'Abgrundtiefes Tor', en: 'Abyssal Gate' },

    'NONE': { de: 'Keine', en: 'None' },
    'GOBLIN_SWARM': { de: 'Goblin-Schwarm (+100% Gold, +50% Schaden)', en: 'Goblin Swarm (+100% Gold, +50% Damage)' },
    'TOXIC_MIST': { de: 'Giftiger Nebel (+100% XP, +100% Schaden)', en: 'Toxic Mist (+100% XP, +100% Damage)' },
    'TREASURE_GOBLIN': { de: 'Schatzgoblin (+300% Gold, +100% Beutechance)', en: 'Treasure Goblin (+300% Gold, +100% Loot Chance)' },
    'ANCIENT_BLESSING': { de: 'Uralter Segen (+50% Speed, -50% Schaden)', en: 'Ancient Blessing (+50% Speed, -50% Damage)' },

    // Upgrades
    'Gilden-Rekrutierung (Schaden)': { de: 'Gilden-Rekrutierung (Schaden)', en: 'Guild Recruitment (Damage)' },
    'Gilden-Steuern (Gold)': { de: 'Gilden-Steuern (Gold)', en: 'Guild Taxes (Gold)' },
    'Kritischer Fokus': { de: 'Kritischer Fokus', en: 'Critical Focus' },
    'Marschgeschwindigkeit': { de: 'Marschgeschwindigkeit', en: 'Marching Speed' },
    'Offline-Schatzkammer': { de: 'Offline-Schatzkammer', en: 'Offline Treasury' },
    'Gilden-Heilungsrate': { de: 'Gilden-Heilungsrate', en: 'Guild Healing Rate' },
    'Gilden-Erfahrung': { de: 'Gilden-Erfahrung', en: 'Guild Experience' },
    'Gilden-Tresor': { de: 'Gilden-Tresor', en: 'Guild Vault' },

    'Erhöht den Basisschaden aller Helden um +5.': {
      de: 'Erhöht den Basisschaden aller Helden um +5.',
      en: 'Increases base damage of all heroes by +5.'
    },
    'Erhöht den Goldgewinn aus Dungeons um +10%.': {
      de: 'Erhöht den Goldgewinn aus Dungeons um +10%.',
      en: 'Increases gold gain from dungeons by +10%.'
    },
    'Erhöht die kritische Trefferchance um +1%.': {
      de: 'Erhöht die kritische Trefferchance um +1%.',
      en: 'Increases critical hit chance by +1%.'
    },
    'Verkürzt die Dauer aller Dungeons um +2%.': {
      de: 'Verkürzt die Dauer aller Dungeons um +2%.',
      en: 'Reduces duration of all dungeons by +2%.'
    },
    'Ermöglicht das Sammeln von Gold im Offline-Modus (+5% Rate).': {
      de: 'Ermöglicht das Sammeln von Gold im Offline-Modus (+5% Rate).',
      en: 'Allows gold collection while offline (+5% rate).'
    },
    'Erhöht die passive Regeneration um +1 HP/Sekunde außerhalb von Dungeons.': {
      de: 'Erhöht die passive Regeneration um +1 HP/Sekunde außerhalb von Dungeons.',
      en: 'Increases passive HP regen by +1 HP/sec outside of dungeons.'
    },
    'Erhöht den Erfahrungsgewinn in Dungeons um +10%.': {
      de: 'Erhöht den Erfahrungsgewinn in Dungeons um +10%.',
      en: 'Increases XP gained in dungeons by +10%.'
    },
    'Erhöht das maximale Schlüssel-Limit um +1 (Max +10).': {
      de: 'Erhöht das maximale Schlüssel-Limit um +1 (Max +10).',
      en: 'Increases max key limit by +1 (Max +10).'
    },

    // Relics
    'Zerstörer-Axt': { de: 'Zerstörer-Axt', en: 'Destroyer\'s Axe' },
    'Midas-Kelch': { de: 'Midas-Kelch', en: 'Midas Chalice' },
    'Zeitsanduhr': { de: 'Zeitsanduhr', en: 'Hourglass of Time' },
    'Phoenix-Feder': { de: 'Phoenix-Feder', en: 'Phoenix Feather' },
    'Meisterschlüssel': { de: 'Meisterschlüssel', en: 'Master Key' },

    'Erhöht den Schaden aller Helden um 10% pro Stufe.': {
      de: 'Erhöht den Schaden aller Helden um 10% pro Stufe.',
      en: 'Increases damage of all heroes by 10% per level.'
    },
    'Erhöht den erhaltenen Goldbonus um 15% pro Stufe.': {
      de: 'Erhöht den erhaltenen Goldbonus um 15% pro Stufe.',
      en: 'Increases gold earned by 15% per level.'
    },
    'Erhöht die Geschwindigkeit in Dungeons um 5% pro Stufe.': {
      de: 'Erhöht die Geschwindigkeit in Dungeons um 5% pro Stufe.',
      en: 'Increases dungeon speed by 5% per level.'
    },
    'Erhöht die maximalen HP aller Helden um 12% pro Stufe.': {
      de: 'Erhöht die maximalen HP aller Helden um 12% pro Stufe.',
      en: 'Increases max HP of all heroes by 12% per level.'
    },
    'Erhöht die Schlüssel-Regeneration um 10% pro Stufe.': {
      de: 'Erhöht die Schlüssel-Regeneration um 10% pro Stufe.',
      en: 'Increases key regeneration by 10% per level.'
    },

    // Potions
    'Eile-Elixier': { de: 'Eile-Elixier', en: 'Elixir of Haste' },
    'Midas-Trank': { de: 'Midas-Trank', en: 'Midas Potion' },
    'Finder-Glück': { de: 'Finder-Glück', en: 'Finder\'s Fortune' },

    'Tempo-Schub': { de: 'Tempo-Schub', en: 'Haste Buff' },
    'Gold-Buff': { de: 'Gold-Buff', en: 'Gold Buff' },
    'Beutechance-Buff': { de: 'Beutechance-Buff', en: 'Loot Buff' },

    // Quests Titles
    'Goldsammler': { de: 'Goldsammler', en: 'Gold Collector' },
    'Dungeon-Bezwinger': { de: 'Dungeon-Bezwinger', en: 'Dungeon Conqueror' },
    'Heldentraining': { de: 'Heldentraining', en: 'Hero Training' },
    'Klick-Enthusiast': { de: 'Klick-Enthusiast', en: 'Click Enthusiast' },

    'Sammle insgesamt': { de: 'Sammle insgesamt', en: 'Collect a total of' },
    'Schließe insgesamt': { de: 'Schließe insgesamt', en: 'Complete a total of' },
    'Dungeon-Läufe ab': { de: 'Dungeon-Läufe ab', en: 'dungeon runs' },
    'Erreiche ein Helden-Gesamtlevel von': { de: 'Erreiche ein Helden-Gesamtlevel von', en: 'Reach a total hero level of' },
    'Klicke': { de: 'Klicke', en: 'Click' },
    'Mal manuell': { de: 'Mal manuell', en: 'times manually' },

    // Dynamic Quests & Achievements from game-data.ts
    'Veteran Recruiter': { de: 'Veteranen-Rekrutierer', en: 'Veteran Recruiter' },
    'Upgrade your heroes 50 times.': { de: 'Verbessere deine Helden 50-mal.', en: 'Upgrade your heroes 50 times.' },
    'First Steps': { de: 'Erste Schritte', en: 'First Steps' },
    'Complete your first dungeon.': { de: 'Schließe dein erstes Dungeon ab.', en: 'Complete your first dungeon.' },
    'Dragon Slayer': { de: 'Drachentöter', en: 'Dragon Slayer' },
    'Defeat the dragon in the Dragon Lair.': { de: 'Besiege den Drachen im Drachenhort.', en: 'Defeat the dragon in the Dragon Lair.' },
    'Grand Guild': { de: 'Großartige Gilde', en: 'Grand Guild' },
    'Reach a combined guild level of 250.': { de: 'Erreiche ein kombiniertes Gilden-Level von 250.', en: 'Reach a combined guild level of 250.' },
    'Master of Heroes': { de: 'Meister der Helden', en: 'Master of Heroes' },
    'Unlock all 6 heroes.': { de: 'Schalte alle 6 Helden frei.', en: 'Unlock all 6 heroes.' },

    // Stats & Workshop Alerts
    'Attack Power': { de: 'Angriffskraft', en: 'Attack Power' },
    'Max HP': { de: 'Max HP', en: 'Max HP' },
    'Gold Gain': { de: 'Goldgewinn', en: 'Gold Gain' },
    'XP Gain': { de: 'Erfahrungsgewinn', en: 'XP Gain' },
    'You can only select up to 3 items to combine!': {
      de: 'Du kannst nur bis zu 3 Items zum Kombinieren auswählen!',
      en: 'You can only select up to 3 items to combine!'
    },
    'All 3 items must have the same rarity, and must not be Legendary!': {
      de: 'Alle 3 Gegenstände müssen dieselbe Seltenheit haben und dürfen nicht legendär sein!',
      en: 'All 3 items must have the same rarity, and must not be Legendary!'
    },
    'Select items using checkboxes.': {
      de: 'Wähle Gegenstände über die Kontrollkästchen aus.',
      en: 'Select items using checkboxes.'
    },
    'FORGE HIGHER TIER ITEM': {
      de: 'HÖHERSTUFIGEN GEGENSTAND SCHMIEDEN',
      en: 'FORGE HIGHER TIER ITEM'
    },
    'SELECT 3 ITEMS': {
      de: 'WÄHLE 3 GEGENSTÄNDE AUS',
      en: 'SELECT 3 ITEMS'
    },
    'No active elixirs. Brew potions to accelerate your progression!': {
      de: 'Keine aktiven Elixiere. Braue Tränke, um deinen Fortschritt zu beschleunigen!',
      en: 'No active elixirs. Brew potions to accelerate your progression!'
    },
    'Speed +50%': { de: 'Tempo +50%', en: 'Speed +50%' },
    'Gold x2': { de: 'Gold x2', en: 'Gold x2' },
    'Loot Rate x2': { de: 'Beuterate x2', en: 'Loot Rate x2' },
    'Heal (5 Gems)': { de: 'Heilen (5 Edelsteine)', en: 'Heal (5 Gems)' },

    // Heroes Guild Page
    'Hire Hero': { de: 'Held anwerben', en: 'Hire Hero' },
    'Hire and train elite champions to conquer the unknown.': {
      de: 'Rekrutiere und trainiere Elite-Champions, um das Unbekannte zu erobern.',
      en: 'Hire and train elite champions to conquer the unknown.'
    },
    'Guild Funds': { de: 'Gildengold', en: 'Guild Funds' },
    'Join the guild for': { de: 'Tritt der Gilde bei für', en: 'Join the guild for' },
    'HP STATE': { de: 'HP-STATUS', en: 'HP STATE' },
    '• RESTING': { de: '• ERHOLUNG', en: '• RESTING' },
    '• DEPLOYED': { de: '• IM DUNGEON', en: '• DEPLOYED' },
    '• IDLE': { de: '• BEREIT', en: '• IDLE' },
    'Status': { de: 'Status', en: 'Status' },
    'Recovering HP': { de: 'Regeneriert HP', en: 'Recovering HP' },
    'At Guild Hall': { de: 'In der Gilde', en: 'At Guild Hall' },
    '✨ Class Skill:': { de: '✨ Klassenfähigkeit:', en: '✨ Class Skill:' },
    'Total Power': { de: 'Angriff', en: 'Total Power' },
    'TRAIN HERO': { de: 'HELD TRAINIEREN', en: 'TRAIN HERO' },
    'DEPLOY': { de: 'ENTSENDEN', en: 'DEPLOY' },
    'Recall Hero': { de: 'Held zurückrufen', en: 'Recall Hero' },
    'Available Dungeons': { de: 'Verfügbare Dungeons', en: 'Available Dungeons' },
    'Currently Equipped': { de: 'Derzeit ausgerüstet', en: 'Currently Equipped' },
    'Available in Armory': { de: 'In Rüstkammer verfügbar', en: 'Available in Armory' },
    'Equip': { de: 'Anlegen', en: 'Equip' },
    'Equip Weapon': { de: 'Waffe anlegen', en: 'Equip Weapon' },
    'Equip Armor': { de: 'Rüstung anlegen', en: 'Equip Armor' },
    'Equip Accessory': { de: 'Accessoire anlegen', en: 'Equip Accessory' },
    'No matching weapons in your armory. Go clear dungeons to find loot!': {
      de: 'Keine passenden Waffen in der Rüstkammer. Schließe Dungeons ab, um Beute zu finden!',
      en: 'No matching weapons in your armory. Go clear dungeons to find loot!'
    },
    'No matching armors in your armory. Go clear dungeons to find loot!': {
      de: 'Keine passenden Rüstungen in der Rüstkammer. Schließe Dungeons ab, um Beute zu finden!',
      en: 'No matching armors in your armory. Go clear dungeons to find loot!'
    },
    'No matching accessorys in your armory. Go clear dungeons to find loot!': {
      de: 'Keine passenden Accessoires in der Rüstkammer. Schließe Dungeons ab, um Beute zu finden!',
      en: 'No matching accessorys in your armory. Go clear dungeons to find loot!'
    },
    'No weapon currently equipped.': {
      de: 'Derzeit keine Waffe ausgerüstet.',
      en: 'No weapon currently equipped.'
    },
    'No armor currently equipped.': {
      de: 'Derzeit keine Rüstung ausgerüstet.',
      en: 'No armor currently equipped.'
    },
    'No accessory currently equipped.': {
      de: 'Derzeit kein Accessoire ausgerüstet.',
      en: 'No accessory currently equipped.'
    },
  };

  public t(key: string): string {
    if (!key) return '';
    const lang = this.language();
    const trimmed = key.trim();
    const entry = this.translations[trimmed];
    if (!entry) return key;
    return entry[lang] || key;
  }
}
