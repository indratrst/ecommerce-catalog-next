"use client";

import { useState } from "react";
import { BillingAddress } from "@/types/checkout";
import { Phone, Mail, User, ChevronDown } from "lucide-react";
import {
  getProvinces,
  getRegencies,
  getDistricts,
} from "@/services/wilayah";

interface CheckoutFormProps {
  deliveryMethod: "shipping" | "pickup";
  onChange: (data: Partial<BillingAddress>) => void;
}

export function CheckoutForm({ deliveryMethod, onChange }: CheckoutFormProps) {
  const [formData, setFormData] = useState<Partial<BillingAddress>>({});
  
  const provinces = getProvinces().data;

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const regencies = getRegencies(selectedProvince).data;
  const districts = getDistricts(selectedRegency).data;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const province = provinces.find(p => p.code === code);
    setSelectedProvince(code);
    setSelectedRegency("");
    setSelectedDistrict("");
    setFormData({
      ...formData,
      areaId: "",
      areaName: province?.name || "",
      province_name: province?.name || "",
      city_name: undefined,
      district_name: undefined,
    });
    onChange({
      ...formData,
      areaId: "",
      areaName: province?.name || "",
      province_name: province?.name || "",
      city_name: undefined,
      district_name: undefined,
    });
  };

  const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const regency = regencies.find(r => r.code === code);
    setSelectedRegency(code);
    setSelectedDistrict("");
    
    const province = provinces.find(p => p.code === selectedProvince);
    const areaName = `${regency?.name}, ${province?.name}`;
    
    const newData: Partial<BillingAddress> = { 
      ...formData, 
      areaName,
      province_name: province?.name || "",
      city_name: regency?.name 
    };
    setFormData(newData);
    onChange(newData);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const district = districts.find(d => d.code === code);
    setSelectedDistrict(code);
    
    const regency = regencies.find(r => r.code === selectedRegency);
    const province = provinces.find(p => p.code === selectedProvince);
    const areaName = `${district?.name}, ${regency?.name}, ${province?.name}`;
    
    const newData: Partial<BillingAddress> = { 
      ...formData, 
      areaId: code,
      areaName,
      province_name: province?.name || "",
      city_name: regency?.name,
      district_name: district?.name
    };
    setFormData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold uppercase tracking-wider border-b pb-2" style={{ borderColor: "var(--surface-border)" }}>
        Billing Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">First Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              name="firstName"
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              placeholder="First Name"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">Last Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              name="lastName"
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              placeholder="Last Name"
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="email"
              name="email"
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              placeholder="Email"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">Phone *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="tel"
              name="phone"
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              placeholder="Phone Number"
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {deliveryMethod === "shipping" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Province */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground block">Province *</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border-none p-3 text-sm focus:ring-1 focus:ring-foreground appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  onChange={handleProvinceChange}
                  value={selectedProvince}
                >
                  <option value="" style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}>Select Province</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code} style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none" />
              </div>
            </div>

            {/* Regency */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground block">City / Regency *</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border-none p-3 text-sm focus:ring-1 focus:ring-foreground appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  disabled={!selectedProvince || regencies.length === 0}
                  onChange={handleRegencyChange}
                  value={selectedRegency}
                >
                  <option value="" style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
                    {selectedProvince && regencies.length === 0 ? "No mock city data for this province" : "Select City"}
                  </option>
                  {regencies.map(r => (
                    <option key={r.code} value={r.code} style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none" />
              </div>
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground block">District *</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border-none p-3 text-sm focus:ring-1 focus:ring-foreground appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  disabled={!selectedRegency || districts.length === 0}
                  onChange={handleDistrictChange}
                  value={selectedDistrict}
                >
                  <option value="" style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
                    {selectedRegency && districts.length === 0 ? "No mock district data for this city" : "Select District"}
                  </option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code} style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground block">Street Address *</label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full bg-surface border-none p-3 text-sm focus:ring-1 focus:ring-foreground"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              placeholder="House number and street name"
              onChange={handleInputChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
