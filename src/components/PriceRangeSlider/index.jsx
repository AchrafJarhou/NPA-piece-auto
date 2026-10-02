import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../slices/filtersSlice";
import "./index.scss";

export default function PriceRangeSlider({ onApply }) {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);

  const minLimit = 0;
  const maxLimit = 1000;
  const priceGap = 50;
  const priceStep = 25;

  const minPrice =
    filters.min_price !== "" && filters.min_price !== undefined
      ? Number(filters.min_price)
      : minLimit;
  const maxPrice =
    filters.max_price !== "" && filters.max_price !== undefined
      ? Number(filters.max_price)
      : maxLimit;

  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  const handleMinRange = (e) => {
    const value = Number(e.target.value);
    if (draftMaxPrice - value >= priceGap) {
      setDraftMinPrice(value);
    }
  };

  const handleMaxRange = (e) => {
    const value = Number(e.target.value);
    if (value - draftMinPrice >= priceGap) {
      setDraftMaxPrice(value);
    }
  };

  const commitMinRange = (e) => {
    const value = Number(e.currentTarget.value);
    if (draftMaxPrice - value >= priceGap) {
      dispatch(setFilters({ min_price: value }));
      onApply?.();
    }
  };

  const commitMaxRange = (e) => {
    const value = Number(e.currentTarget.value);
    if (value - draftMinPrice >= priceGap) {
      dispatch(setFilters({ max_price: value }));
      onApply?.();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "min_price") setDraftMinPrice(value);
    if (name === "max_price") setDraftMaxPrice(value);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    let numVal = Number(value);

    if (name === "min_price") {
      if (isNaN(numVal) || numVal < minLimit) numVal = minLimit;
      if (numVal > draftMaxPrice - priceGap) numVal = draftMaxPrice - priceGap;

      setDraftMinPrice(numVal);
      dispatch(setFilters({ min_price: numVal }));
      onApply?.();
    }

    if (name === "max_price") {
      if (isNaN(numVal) || numVal > maxLimit) numVal = maxLimit;
      if (numVal < draftMinPrice + priceGap) numVal = draftMinPrice + priceGap;

      setDraftMaxPrice(numVal);
      dispatch(setFilters({ max_price: numVal }));
      onApply?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const leftPercent = (Math.max(minLimit, draftMinPrice) / maxLimit) * 100;
  const rightPercent =
    100 - (Math.min(maxLimit, draftMaxPrice) / maxLimit) * 100;

  return (
    <div className="price-range-slider">
      <input
        type="number"
        name="min_price"
        value={draftMinPrice}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="Prix min (€)"
      />

      <div className="custom-wrapper">
        <div className="price-input-container">
          <div className="slider">
            <div
              className="price-slider"
              style={{
                left: `${leftPercent}%`,
                right: `${rightPercent}%`,
              }}
            />
            <span
              className="range-thumb min-thumb"
              style={{ left: `${leftPercent}%` }}
            />
            <span
              className="range-thumb max-thumb"
              style={{ left: `${100 - rightPercent}%` }}
            />
          </div>
        </div>

        <div className="range-input">
          <input
            type="range"
            className="min-range"
            min={minLimit}
            max={maxLimit}
            value={draftMinPrice}
            step={priceStep}
            onChange={handleMinRange}
            onPointerUp={commitMinRange}
            onPointerCancel={commitMinRange}
            onKeyUp={commitMinRange}
            tabIndex="-1"
          />
          <input
            type="range"
            className="max-range"
            min={minLimit}
            max={maxLimit}
            value={draftMaxPrice}
            step={priceStep}
            onChange={handleMaxRange}
            onPointerUp={commitMaxRange}
            onPointerCancel={commitMaxRange}
            onKeyUp={commitMaxRange}
            tabIndex="-1"
          />
        </div>
      </div>

      <input
        type="number"
        name="max_price"
        value={draftMaxPrice}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="Prix max (€)"
      />
    </div>
  );
}
