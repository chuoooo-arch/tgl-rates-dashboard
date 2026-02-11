/*
  Warnings:

  - A unique constraint covering the columns `[mode,origin_port_code,destination_port_code,carrier,currency,valid_from,valid_to,min,rate_45,rate_100,rate_300,rate_500,rate_1000,surcharge_1000,etd,agency]` on the table `air_rate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mode,origin,destination,carrier,currency,valid_from,valid_to,rate_20gp,rate_40gp,rate_40hc,rate_20_rf,rate_40_rf,transit_time,etd,agency]` on the table `sea_fcl_rate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mode,origin_port_code,destination_port_code,carrier,currency,valid_from,valid_to,w_m,min_charge,refund_freight,transit_time,agency]` on the table `sea_lcl_rate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "air_rate_mode_origin_port_code_destination_port_code_carrier_currency_valid_from_valid_to_min_rate_45_rate_100_rate_300_rate_500_rate_1000_surcharge_1000_etd_agency_key" ON "air_rate"("mode", "origin_port_code", "destination_port_code", "carrier", "currency", "valid_from", "valid_to", "min", "rate_45", "rate_100", "rate_300", "rate_500", "rate_1000", "surcharge_1000", "etd", "agency");

-- CreateIndex
CREATE UNIQUE INDEX "sea_fcl_rate_mode_origin_destination_carrier_currency_valid_from_valid_to_rate_20gp_rate_40gp_rate_40hc_rate_20_rf_rate_40_rf_transit_time_etd_agency_key" ON "sea_fcl_rate"("mode", "origin", "destination", "carrier", "currency", "valid_from", "valid_to", "rate_20gp", "rate_40gp", "rate_40hc", "rate_20_rf", "rate_40_rf", "transit_time", "etd", "agency");

-- CreateIndex
CREATE UNIQUE INDEX "sea_lcl_rate_mode_origin_port_code_destination_port_code_carrier_currency_valid_from_valid_to_w_m_min_charge_refund_freight_transit_time_agency_key" ON "sea_lcl_rate"("mode", "origin_port_code", "destination_port_code", "carrier", "currency", "valid_from", "valid_to", "w_m", "min_charge", "refund_freight", "transit_time", "agency");
