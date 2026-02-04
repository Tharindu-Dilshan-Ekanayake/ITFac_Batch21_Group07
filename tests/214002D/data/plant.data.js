export const categoryId = "2";
export const price = "250";
export const quantityLow = "2";
export const quantityNormal = "10";

export const generatePlantNames = () => {
  const timestamp = Date.now();
  const uniqueId = Math.floor(Math.random() * 1000);

  return {
    plantNameNormal: `Test Tulip ${timestamp}`,
    plantNameLow: `RoseLow${uniqueId}`,
  };
};
