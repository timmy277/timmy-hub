export interface Province {
  id: string;
  code: string;
  name: string;
  slug: string;
}

export interface District {
  id: string;
  code: string;
  provinceCode: string;
  name: string;
  slug: string;
}

export interface Ward {
  id: string;
  code: string;
  districtCode: string;
  name: string;
  slug: string;
}

export interface LocationAddress {
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
}
