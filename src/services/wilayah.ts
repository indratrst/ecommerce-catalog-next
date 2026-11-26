import mockProvinces from "../../data-address/tmp_provinces.json";
import mockRegencies from "../../data-address/tmp_regencies.json";
import mockBandungDistricts from "../../data-address/tmp_ro_districts.json";

export interface WilayahOption {
  code: string;
  name: string;
}

const provinces: WilayahOption[] = mockProvinces.data.map(({ code, name }) => ({
  code,
  name,
}));

const regencies: WilayahOption[] = mockRegencies.data.map(({ code, name }) => ({
  code,
  name,
}));

const bandungDistricts: WilayahOption[] = mockBandungDistricts.data.map(
  ({ id, name }) => ({
    code: String(id),
    name,
  }),
);

export function getProvinces() {
  return { data: provinces };
}

export function getRegencies(provinceCode: string) {
  return {
    data: regencies.filter(({ code }) => code.startsWith(`${provinceCode}.`)),
  };
}

export function getDistricts(regencyCode: string) {
  // The checked-in mock district list is specifically for Kota Bandung.
  return {
    data: regencyCode === "32.73" ? bandungDistricts : [],
  };
}
