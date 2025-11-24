"use client";
import CustomCheckBox from "../../../components/shop/CustomCheckBox";
import { useSelector, useDispatch } from "react-redux";
import { filterByColor, filterByPriceRange } from "../../../store/slices/filterSlice";
import React, { useState } from "react";

const ShopSidebar = () => {
  const dispatch = useDispatch();
  const allProducts = useSelector((state) => state.filter.allProducts);
  const [minValue, setMinValue] = useState();
  const [maxValue, setMaxValue] = useState();

  const getProductsByColor = (color) => {
    dispatch(filterByColor(color));
  };

  const handleApply = (e) => {
    e.preventDefault();
    dispatch(filterByPriceRange({ minValue, maxValue }));
  };

  const getCategoryAndProductQuantity = (property) => {
    let categoryCounts = {};
    allProducts.forEach((currentElement) => {
      const category = currentElement[property];
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
    });

    let uniqueCategories = Object.keys(categoryCounts);
    let uniqueData = uniqueCategories.map((category) => ({
      category: category,
      count: categoryCounts[category],
    }));

    return [
      { category: "All", count: allProducts.length },
      ...uniqueData,
    ];
  };

  const uniqueColors = Array.from(
    new Set(allProducts.flatMap((product) => 
      product.images ? Object.keys(product.images) : []
    ))
  );

  const newCategory = getCategoryAndProductQuantity("category");

  const brands = getCategoryAndProductQuantity("brand");

  return (
    <div className="mx-4 lg:mx-0   max-w-[310px] py-4">
      <div className="px-4 py-4 col-span-3 shadow-md shadow-gray-300 bg-white rounded-md">
        <p className="text-base text-gray-800 font-semibold mb-2">
          CATEGORIES
        </p>
        {newCategory.map((item, index) => (
          <div className="between" key={index}>
            <CustomCheckBox label={item.category} filterBy="CATEGORIES"/>
            <span className="text-gray-600 text-sm">({item.count})</span>
          </div>
        ))}
      </div>

      {/* Category Filter Ends */}
      {/* Brands Filter */}
      <div className="mt-6 px-4 py-4 col-span-3 shadow-md shadow-gray-300 bg-white rounded-md">
        <p className="text-base text-gray-800 font-semibold mb-2">BRANDS</p>
        {brands.map((item, index) => (
          <div className="between" key={index}>
            <CustomCheckBox label={item.category} filterBy="BRANDS"/>
            <span className="text-gray-600 text-sm">({item.count})</span>
          </div>
        ))}
      </div>
      {/* Brands Filter Ends */}

      {/* Color Filter */}
      <div className="mt-6 px-4 py-4 col-span-3 shadow-md rounded-s-md shadow-gray-300 bg-white ">
        <p className="text-base font-semibold mb-4 text-gray-800  ">COLOR</p>
        {/* Single Size */}
        <div className="grid grid-cols-12 gap-2 ">
          {uniqueColors.map((property, index) => (
            <div key={index}>
              <div
                className={`${
                  property === "white" ? "border border-slate-300" : null
                } w-3 h-7 rounded-full cursor-pointer m-2 hover:border-2 hover:border-sandyBrown`}
                style={{
                  backgroundColor: property,
                  color: property,
                  boxShadow: "gray",
                }}
                key={index}
                onClick={() => getProductsByColor(property)}
              />
            </div>
          ))}
        </div>
        {/* Single Size Ends */}
      </div>

      {/* Price */}
      <div className="mt-6 px-4 py-4 col-span-3 shadow-md shadow-gray-300 rounded-md bg-white">
        <p className="text-base font-semibold text-gray-800 ">PRICE</p>
        <form className="flex items-center mt-4 text-xs" onSubmit={handleApply}>
          <input
            type="number"
            placeholder="Min"
            className="w-full px-3 py-1 focus:bg-slate-100 rounded-md outline-none bg-slate-50"
            onChange={(e) => setMinValue(parseInt(e.target.value))}
          />
          <span className="text-gray-500 px-3">To</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full px-3 py-1 focus:bg-slate-100 rounded-md outline-none bg-slate-50"
            onChange={(e) => setMaxValue(parseInt(e.target.value))}
          />
          <button
            type="submit"
            className="text-orangeRed ml-5 rounded bg-darkChocolate pt-0.5 pb-1 px-2"
          >
            Apply
          </button>
        </form>
      </div>
      {/* Price Ends */}
    </div>
  );
};

export default ShopSidebar;
