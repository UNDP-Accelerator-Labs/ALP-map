export const capitalize = function () {
  return this.valueOf().charAt(0).toUpperCase() + this.valueOf().slice(1);
};
export const makeSafe = function () {
  return this.valueOf().toLowerCase().replace(/[^a-z0-9]/gi, '_');
}