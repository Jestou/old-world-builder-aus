import { useState, useEffect, Fragment } from "react";
import { useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";

import { Button } from "../../components/button";
import { Header, Main } from "../../components/page";
import { SegmentedSelect } from "../../components/select";
import { Expandable } from "../../components/expandable";
import { NumberInput } from "../../components/number-input";
import { getGameSystems } from "../../utils/game-systems";
import { getRandomId } from "../../utils/id";
import { useLanguage } from "../../utils/useLanguage";
import { setLists } from "../../state/lists";
import { updateSetting } from "../../state/settings";
import { RulesIndex, RuleWithIcon } from "../../components/rules-index";

import { nameMap } from "../magic";

import owb from "../../assets/army-icons/owb.svg";
import theEmpire from "../../assets/army-icons/the-empire.svg";
import dwarfs from "../../assets/army-icons/dwarfs.svg";
import greenskins from "../../assets/army-icons/greenskins.svg";
import beastmen from "../../assets/army-icons/beastmen.svg";
import chaosDeamons from "../../assets/army-icons/chaos-deamons.svg";
import chaosWarriors from "../../assets/army-icons/chaos-warriors.svg";
import darkElves from "../../assets/army-icons/dark-elves.svg";
import highElves from "../../assets/army-icons/high-elves.svg";
import lizardmen from "../../assets/army-icons/lizardmen.svg";
import ogres from "../../assets/army-icons/ogres.svg";
import skaven from "../../assets/army-icons/skaven.svg";
import tombKings from "../../assets/army-icons/tomb-kings.svg";
import vampireCounts from "../../assets/army-icons/vampire-counts.svg";
import woodElves from "../../assets/army-icons/wood-elves.svg";
import chaosDwarfs from "../../assets/army-icons/chaos-dwarfs.svg";
import bretonnia from "../../assets/army-icons/bretonnia.svg";
import cathay from "../../assets/army-icons/cathay.svg";
import renegade from "../../assets/army-icons/renegade.svg";

import "./NewList.css";

const armyIconMap = {
  "the-empire": theEmpire,
  dwarfs: dwarfs,
  greenskins: greenskins,
  "empire-of-man": theEmpire,
  "orc-and-goblin-tribes": greenskins,
  "dwarfen-mountain-holds": dwarfs,
  "warriors-of-chaos": chaosWarriors,
  "kingdom-of-bretonnia": bretonnia,
  "beastmen-brayherds": beastmen,
  "wood-elf-realms": woodElves,
  "tomb-kings-of-khemri": tombKings,
  "high-elf-realms": highElves,
  "dark-elves": darkElves,
  skaven: skaven,
  "vampire-counts": vampireCounts,
  "daemons-of-chaos": chaosDeamons,
  "ogre-kingdoms": ogres,
  lizardmen: lizardmen,
  "chaos-dwarfs": chaosDwarfs,
  "grand-cathay": cathay,
  "renegade-crowns": renegade,
};

export const NewList = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { language } = useLanguage();
  const gameSystems = getGameSystems();
  const lists = useSelector((state) => state.lists);
  const settings = useSelector((state) => state.settings);

  const [game, setGame] = useState("the-old-world");
  const [army, setArmy] = useState("empire-of-man");
  const [compositionRule, setCompositionRule] = useState("open-war");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(2000);
  const [armyComposition, setArmyComposition] = useState("empire-of-man");
  const [redirect, setRedirect] = useState(null);

  // New state for collapsible accordion steps (0 to 3)
  const [activeStep, setActiveStep] = useState(0);

  const armies = gameSystems
    .filter(({ id }) => id === game)[0]
    .armies.sort((a, b) => a.id.localeCompare(b.id));
  const journalArmies = armies.find(({ id }) => army === id)?.armyComposition;

  const compositionRules = [
    {
      id: "open-war",
      name_en: intl.formatMessage({ id: "misc.open-war" }),
    },
    {
      id: "grand-melee",
      name_en: intl.formatMessage({ id: "misc.grand-melee" }),
    },
    {
      id: "combined-arms",
      name_en: intl.formatMessage({ id: "misc.combined-arms" }),
    },
    {
      id: "grand-melee-combined-arms",
      name_en: intl.formatMessage({ id: "misc.grand-melee-combined-arms" }),
    },
    {
      id: "battle-march",
      name_en: intl.formatMessage({ id: "misc.battle-march" }),
    },
  ];

  const listsPoints = [
    ...lists
      .filter((list) => list.type !== "folder")
      .map((list) => list.points),
  ].reverse();
  const quickActions =
    compositionRule === "battle-march"
      ? [500, 600, 750]
      : lists.length
      ? [...new Set([...listsPoints, 500, 1000, 1500, 2000, 2500])].slice(0, 5)
      : [500, 1000, 1500, 2000, 2500];

  const createList = () => {
    const newId = getRandomId();
    const armyData = armies.find(({ id }) => id === army);
    const newList = {
      name:
        name ||
        nameMap[armyComposition]?.[`name_${language}`] ||
        nameMap[armyComposition]?.name_en ||
        (nameMap[army] && nameMap[army][`name_${language}`]) ||
        nameMap[army]?.name_en ||
        army,
      description: description,
      game: game,
      points: points,
      army: army,
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
      id: newId,
      url: armyData?.url,
      armyComposition,
      compositionRule,
    };
    const newLists = [newList, ...lists];
    const newSettings = { ...settings, lastChanged: new Date().toString() };

    localStorage.setItem("owb.lists", JSON.stringify(newLists));
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));
    dispatch(setLists(newLists));
    dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));

    setRedirect(newId);
  };

  const handleSystemChange = (gameId) => {
    setGame(gameId);
    const systemArmies = gameSystems.filter(({ id }) => id === gameId)[0].armies;
    const sortedSystemArmies = [...systemArmies].sort((a, b) => a.id.localeCompare(b.id));
    const defaultArmy = sortedSystemArmies[0]?.id || "";
    setArmy(defaultArmy);
    if (defaultArmy) {
      const selectedArmyObj = sortedSystemArmies[0];
      setArmyComposition(selectedArmyObj.armyComposition?.[0] || defaultArmy);
    }
    setCompositionRule("open-war");
    setActiveStep(1); // Auto-advance to army selection
  };

  const handleArmyChange = (armyId) => {
    setArmy(armyId);
    const selectedArmyObj = armies.find(({ id }) => id === armyId);
    if (selectedArmyObj) {
      if (selectedArmyObj.armyComposition && selectedArmyObj.armyComposition.length > 0) {
        setArmyComposition(selectedArmyObj.armyComposition[0]);
      } else {
        setArmyComposition(armyId);
      }
    }
    setCompositionRule("open-war");
    setActiveStep(2); // Auto-advance to rules selection
  };

  const handleArcaneJournalChange = (value) => {
    setArmyComposition(value);
  };

  const handleCompositionRuleChange = (value) => {
    setCompositionRule(value);
  };

  const handlePointsChange = (event) => {
    setPoints(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createList();
  };

  const handleQuickActionClick = (event) => {
    event.preventDefault();
    setPoints(Number(event.target.value));
  };

  const handleHeaderClick = (stepIndex) => {
    setActiveStep(activeStep === stepIndex ? -1 : stepIndex);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Translate active selections for rendering in headers
  const getGameSystemName = () => {
    return gameSystems.find(({ id }) => id === game)?.name || "";
  };

  const getArmyName = () => {
    const activeArmy = armies.find(({ id }) => id === army);
    return activeArmy ? (activeArmy[`name_${language}`] || activeArmy.name_en) : "";
  };

  const getRulesSummary = () => {
    const ruleObj = compositionRules.find(({ id }) => id === compositionRule);
    const ruleName = ruleObj ? ruleObj.name_en : compositionRule;
    const journalName = journalArmies && armyComposition !== army
      ? (nameMap[armyComposition]?.[`name_${language}`] || nameMap[armyComposition]?.name_en || armyComposition)
      : intl.formatMessage({ id: "new.grandArmy" });

    return journalArmies ? `${journalName} (${ruleName})` : ruleName;
  };

  return (
    <>
      {redirect && <Redirect to={`/editor/${redirect}`} />}

      {isMobile && (
        <Header to="/" headline={intl.formatMessage({ id: "new.title" })} />
      )}

      <RulesIndex />

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to="/"
            headline={intl.formatMessage({ id: "new.title" })}
          />
        )}
        <form onSubmit={handleSubmit} className="new-list">
          <div className="accordion">

            {/* Step 1: Game System */}
            <div className={classNames("accordion-item", activeStep === 0 && "accordion-item--active")}>
              <div className="accordion-header" onClick={() => handleHeaderClick(0)}>
                <div className="accordion-header__title">
                  <span className="accordion-header__step">1</span>
                  <span>Game System</span>
                  {activeStep !== 0 && (
                    <span className="accordion-header__summary">— {getGameSystemName()}</span>
                  )}
                </div>
                <div className="accordion-header__indicator">
                  <Button
                    type="text"
                    color="dark"
                    icon={activeStep === 0 ? "collapse" : "expand"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeaderClick(0);
                    }}
                  />
                </div>
              </div>
              {activeStep === 0 && (
                <div className="accordion-content">
                  <div className="segmented-select">
                    {gameSystems.map(({ name: systemName, id: systemId }) => (
                      <button
                        key={systemId}
                        type="button"
                        onClick={() => handleSystemChange(systemId)}
                        className={classNames(
                          "segmented-select__button",
                          systemId === game && "segmented-select__button--active"
                        )}
                      >
                        {systemName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Choose Army Faction */}
            <div className={classNames("accordion-item", activeStep === 1 && "accordion-item--active")}>
              <div className="accordion-header" onClick={() => handleHeaderClick(1)}>
                <div className="accordion-header__title">
                  <span className="accordion-header__step">2</span>
                  <span><FormattedMessage id="new.army" /></span>
                  {activeStep !== 1 && army && (
                    <span className="accordion-header__summary">— {getArmyName()}</span>
                  )}
                </div>
                <div className="accordion-header__indicator">
                  <Button
                    type="text"
                    color="dark"
                    icon={activeStep === 1 ? "collapse" : "expand"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeaderClick(1);
                    }}
                  />
                </div>
              </div>
              {activeStep === 1 && (
                <div className="accordion-content">
                  <div className="army-grid">
                    {armies.map(({ id: armyId, name_en, name_de, name_cn, name_es, name_fr }) => {
                      const localizedName = {
                        en: name_en,
                        de: name_de,
                        cn: name_cn,
                        es: name_es,
                        fr: name_fr,
                      }[language] || name_en;

                      return (
                        <button
                          key={armyId}
                          type="button"
                          onClick={() => handleArmyChange(armyId)}
                          className={classNames(
                            "army-card",
                            armyId === army && "army-card--active"
                          )}
                        >
                          <img
                            src={armyIconMap[armyId] || owb}
                            alt=""
                            className="army-card__icon"
                            loading="lazy"
                          />
                          <span className="army-card__name">{localizedName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Configure Rules */}
            <div className={classNames("accordion-item", activeStep === 2 && "accordion-item--active")}>
              <div className="accordion-header" onClick={() => handleHeaderClick(2)}>
                <div className="accordion-header__title">
                  <span className="accordion-header__step">3</span>
                  <span>Rules & Composition</span>
                  {activeStep !== 2 && (
                    <span className="accordion-header__summary">— {getRulesSummary()}</span>
                  )}
                </div>
                <div className="accordion-header__indicator">
                  <Button
                    type="text"
                    color="dark"
                    icon={activeStep === 2 ? "collapse" : "expand"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeaderClick(2);
                    }}
                  />
                </div>
              </div>
              {activeStep === 2 && (
                <div className="accordion-content">
                  {journalArmies ? (
                    <>
                      <label htmlFor="arcane-journal" className="new-list__label">
                        <FormattedMessage id="new.armyComposition" />
                      </label>
                      <SegmentedSelect
                        id="arcane-journal"
                        options={journalArmies.map((journalArmy) => ({
                          id: journalArmy,
                          name_en:
                            journalArmy === army
                              ? intl.formatMessage({ id: "new.grandArmy" })
                              : nameMap[journalArmy]?.[`name_${language}`] ||
                                nameMap[journalArmy]?.name_en ||
                                journalArmy,
                        }))}
                        onChange={handleArcaneJournalChange}
                        selected={armyComposition}
                      />
                    </>
                  ) : null}

                  <label htmlFor="composition-rule" className="new-list__label">
                    <FormattedMessage id="new.armyCompositionRule" />
                  </label>
                  <SegmentedSelect
                    id="composition-rule"
                    options={compositionRules}
                    onChange={handleCompositionRuleChange}
                    selected={compositionRule}
                  />

                  <Expandable
                    headline={
                      <span className="new-list__composition-info">
                        <FormattedMessage id="new.armyCompositionRuleInfo" />
                      </span>
                    }
                  >
                    <div className="new-list__composition-description">
                      <i>
                        <FormattedMessage
                          id={`new.armyCompositionRuleDescription.${compositionRule}`}
                        />
                      </i>
                      <RuleWithIcon
                        name={compositionRule}
                        isDark
                        className="game-view__rule-icon"
                      />
                    </div>
                  </Expandable>

                  <div className="accordion-actions">
                    <Button
                      type="primary"
                      onClick={() => setActiveStep(3)}
                      icon="check"
                      spaceTop
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Details */}
            <div className={classNames("accordion-item", activeStep === 3 && "accordion-item--active")}>
              <div className="accordion-header" onClick={() => handleHeaderClick(3)}>
                <div className="accordion-header__title">
                  <span className="accordion-header__step">4</span>
                  <span>List Details</span>
                  {activeStep !== 3 && (
                    <span className="accordion-header__summary">— {points} pts</span>
                  )}
                </div>
                <div className="accordion-header__indicator">
                  <Button
                    type="text"
                    color="dark"
                    icon={activeStep === 3 ? "collapse" : "expand"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeaderClick(3);
                    }}
                  />
                </div>
              </div>
              {activeStep === 3 && (
                <div className="accordion-content">
                  <label htmlFor="points">
                    <FormattedMessage id="misc.points" />
                  </label>
                  <NumberInput
                    id="points"
                    min={0}
                    value={points}
                    onChange={handlePointsChange}
                    required
                    interval={50}
                  />
                  <div className="new-list__quick-actions">
                    <i className="new-list__quick-actions-label">
                      <FormattedMessage id="misc.suggestions" />
                      {": "}
                    </i>
                    {quickActions.map((pointsVal, index) => (
                      <Button
                        type="tertiary"
                        size="small"
                        color="dark"
                        className="new-list__quick-action"
                        value={pointsVal}
                        onClick={handleQuickActionClick}
                        key={index}
                      >
                        {pointsVal}
                      </Button>
                    ))}
                  </div>

                  <label htmlFor="name">
                    <FormattedMessage id="misc.name" />
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={name}
                    onChange={handleNameChange}
                    autoComplete="off"
                    maxLength="100"
                  />

                  <label htmlFor="description">
                    <FormattedMessage id="misc.description" />
                  </label>
                  <input
                    type="text"
                    id="description"
                    className="input"
                    value={description}
                    onChange={handleDescriptionChange}
                    autoComplete="off"
                    maxLength="255"
                  />

                  <Button
                    centered
                    icon="add-list"
                    submitButton
                    spaceTop
                    size="large"
                  >
                    <FormattedMessage id="new.create" />
                  </Button>
                </div>
              )}
            </div>

          </div>
        </form>
      </MainComponent>
    </>
  );
};
