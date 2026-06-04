import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import qs from 'qs';

import StatisticsService from '../../services/StatisticsService';
import { IStatistics } from '../../interfaces/Statistics/IStatistics';


interface StatusCodeCounter {
  x200: number
  x300: number
  x400: number
  x500: number
}

interface MethodCounter {
  GET: number
  HEAD: number
  POST: number
  PUT: number
	DELETE: number
	CONNECT: number
	OPTIONS: number
	TRACE: number
	PATCH: number
}

export interface EndpointCounter {
  url: string
  count: number
}

function statusCodeAsNumber(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function countStatusCode(items: IStatistics[]): StatusCodeCounter {
  const counter: StatusCodeCounter = {
    x200: 0,
    x300: 0,
    x400: 0,
    x500: 0,
  }

  for (const item of items) {
    const code = statusCodeAsNumber(item.status_code);
    if (code >= 200 && code < 300) {
      counter.x200 += 1;
    } else if (code >= 300 && code < 400) {
      counter.x300 += 1;
    } else if (code >= 400 && code < 500) {
      counter.x400 += 1;
    } else if (code >= 500 && code < 600) {
      counter.x500 += 1;
    }
  }

  return counter;
}

function countMethod(items: IStatistics[]): MethodCounter {
  const counter: MethodCounter = {
    GET: 0,
		HEAD: 0,
		POST: 0,
		PUT: 0,
		DELETE: 0,
		CONNECT: 0,
		OPTIONS: 0,
		TRACE: 0,
		PATCH: 0,
  }

  for (const item of items) {
    const method = item.method as keyof MethodCounter;
    if (method in counter) {
      counter[method] += 1;
    }
  }

  return counter;
}

function countEndpoints(items: IStatistics[]): EndpointCounter[] {
  const counter = new Map<string, number>();

  for (const item of items) {
    const normalizedUrl = item.url.replace(/^https?:\/\/[^/]+/i, "");
    counter.set(normalizedUrl, (counter.get(normalizedUrl) ?? 0) + 1);
  }

  return Array.from(counter.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function useStatisticsTable() {
	let pageInitValue;
	let rowsPerPageInitValue;

	if (window.location.search) {
		const params = qs.parse(window.location.search.substring(1));
		pageInitValue = Number(params.page) || 0;
		rowsPerPageInitValue = Number(params.rowsPerPage) || 20;
	} else {
		pageInitValue = 0;
		rowsPerPageInitValue = 20;
	}

	const [statistics, setStatistics] = useState<IStatistics[]>([]);
	const [statusCodeChart, setStatusCodeChart] = useState<StatusCodeCounter>();
	const [methodChart, setMethodChart] = useState<MethodCounter>();
	const [endpointChart, setEndpointChart] = useState<EndpointCounter[]>([]);
	const [amountStatistics, setAmountStatistics] = useState(0);
	const [page, setPage] = useState(pageInitValue);
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageInitValue);
	const [error, setError] = useState(false);
	const navigate = useNavigate();

	const handleChangePage = (
		event: React.MouseEvent<HTMLButtonElement> | null, 
		newPage: number
	) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

	const handleUpdateTable = async () => {
		await fetchStatistics();
	};

	async function fetchStatistics() {
		const response = await StatisticsService.getAll(page, rowsPerPage);
		if (response) {
			setError(false);
			setStatistics(response.data.items);
			setStatusCodeChart(countStatusCode(response.data.items));
			setMethodChart(countMethod(response.data.items));
			setEndpointChart(countEndpoints(response.data.items));
			setAmountStatistics(response.data.totalElements);
		} else {
			setError(true);
			setStatistics([]);
			setStatusCodeChart(undefined);
			setMethodChart(undefined);
			setEndpointChart([]);
			setAmountStatistics(0);
		}
	};

	useEffect(() => {
		const queryString = qs.stringify({
			page,
			rowsPerPage,
		});
		navigate(`?${queryString}`);

		fetchStatistics();
	}, [page, rowsPerPage]);

	return { 
		statistics,
		statusCodeChart,
		methodChart,
		endpointChart,
		amountStatistics,
		page, 
		rowsPerPage,
		error,
		handleUpdateTable,
		handleChangePage, 
		handleChangeRowsPerPage,
	};
};
