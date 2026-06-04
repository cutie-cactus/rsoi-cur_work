import axios from "axios";
import { config } from "../config";
import { SortFlights } from "../enums/SortFlights";
import { IFilterFlight } from "../interfaces/Flight/IFilterFlight";
import { IPaginationFlight } from "../interfaces/Flight/IPaginationFlight";

const api = axios.create({
  baseURL: config.api.baseUrl,   // "/api/v1"
});

function formatDateParam(value: IFilterFlight["minDate"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.format("YYYY-MM-DDTHH:mm:ss");
}

const GatewayRequests = {
  async getListOfFlights(
    page: number,
    size: number,
    sortField: SortFlights,
    filterTable: IFilterFlight
  ): Promise<{ data: IPaginationFlight } | null> {
    const params = new URLSearchParams();
    params.set("page", String(page + 1));
    params.set("size", String(size));
    params.set("sort", sortField);

    if (filterTable.flightNumber) params.set("flightNumber", filterTable.flightNumber);
    if (filterTable.fromAirport) params.set("fromAirport", filterTable.fromAirport);
    if (filterTable.toAirport) params.set("toAirport", filterTable.toAirport);
    if (filterTable.minDate) params.set("minDatetime", formatDateParam(filterTable.minDate));
    if (filterTable.maxDate) params.set("maxDatetime", formatDateParam(filterTable.maxDate));
    if (filterTable.minPrice) params.set("minPrice", String(filterTable.minPrice));
    if (filterTable.maxPrice) params.set("maxPrice", String(filterTable.maxPrice));

    try {
      const response = await api.get<IPaginationFlight>(`/flights?${params.toString()}`);
      return { data: response.data };
    } catch (error) {
      console.log("Gateway: getListOfFlights network error", error);
      return null;
    }
  },
};

export default GatewayRequests;
