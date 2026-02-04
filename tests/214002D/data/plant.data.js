export const price = "250";
export const quantityLow = "2";
export const quantityNormal = "10";

export const generatePlantNames = () => {
  const timestamp = Date.now();
  const uniqueId = Math.floor(Math.random() * 1000);

  return {
    plantNameNormal: `Test Tulip ${timestamp}`,
    plantNameLow: `RoseLow${uniqueId}`,
    plantUpdateName: `Updated  ${uniqueId}`,
    plantDeleteName: `DeleteMe ${uniqueId}`,
    parentCreateName: `Parent ${uniqueId}`,
    CategoryCreateName1: `C_1 ${uniqueId}`,
    CategoryCreateName2: `C_2 ${uniqueId}`,
  };
};
