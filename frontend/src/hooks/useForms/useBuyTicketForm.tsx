import { useState } from 'react';


export function useBuyTicketForm(maxQuantity = 1) {
	const [paidFromBalance, setPaidFromBalance] = useState(false);
	const [quantity, setQuantity] = useState(1);

	const setSafeQuantity = (value: number) => {
		if (!Number.isFinite(value)) {
			setQuantity(1);
			return;
		}
		const normalized = Math.max(1, Math.min(maxQuantity, Math.floor(value)));
		setQuantity(normalized);
	};
	
	return { 
		paidFromBalance,
		setPaidFromBalance,
		quantity,
		setQuantity: setSafeQuantity,
	};
};
