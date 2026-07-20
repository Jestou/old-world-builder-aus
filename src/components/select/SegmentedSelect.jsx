import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { useLanguage } from "../../utils/useLanguage";

import "./SegmentedSelect.css";

export const SegmentedSelect = ({
  options,
  className,
  id,
  selected,
  disabled,
  onChange,
}) => {
  const { language } = useLanguage();

  return (
    <div className={classNames("segmented-select", className)} id={id}>
      {options.map(({ id: optionValue, ...option }) => (
        <button
          key={optionValue}
          type="button"
          disabled={disabled}
          onClick={() => onChange(optionValue)}
          className={classNames(
            "segmented-select__button",
            selected === optionValue && "segmented-select__button--active"
          )}
        >
          {option[`name_${language}`] || option.name_en}
        </button>
      ))}
    </div>
  );
};

SegmentedSelect.propTypes = {
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  selected: PropTypes.string,
  disabled: PropTypes.bool,
};
