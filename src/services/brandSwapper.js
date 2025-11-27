export const brandSwapper = {
    findGenericAlternative(productName) {
        if (!productName) return null;

        const lowerName = productName.toLowerCase();

        if (lowerName.includes('heinz')) {
            return {
                name: "Great Value Ketchup",
                savings: 1.50
            };
        }

        return null;
    }
};
