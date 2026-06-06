import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';

import "./Account.css";
import { DataLoadError } from '../DataLoadError/DataLoadError';
import { BalanceHistory } from './BalanceHistory';
import { UserInfo } from './UserInfo';
import { ProfilePurchaseList } from './ProfilePurchaseList';
import { IUser } from '../../interfaces/User/IUser';
import { IUserInfo } from '../../interfaces/User/IUserInfo';
import GatewayService from '../../services/GatewayService';
import { usePrivilegeInfo } from '../../hooks/useAccount/usePrivilegeInfo';


interface AccountProps {
	user: IUser
}

export function Account({ user }: AccountProps) {
	const {
		privilegeInfo,
		error,
		handleUpdatePrivilegeInfo,
		selectDate,
		selectTime,
	} = usePrivilegeInfo();
	const [userInfo, setUserInfo] = useState<IUserInfo>();
	const [userInfoError, setUserInfoError] = useState(false);

	async function fetchUserInfo() {
		const response = await GatewayService.getUserInformation();
		if (response) {
			setUserInfoError(false);
			setUserInfo(response.data);
		} else {
			setUserInfoError(true);
			setUserInfo(undefined);
		}
	}

	async function handleUpdateProfile() {
		await handleUpdatePrivilegeInfo();
		await fetchUserInfo();
	}

	useEffect(() => {
		fetchUserInfo();
	}, []);

	return (
		<>
			{ !error && !userInfoError
				? <div className="detailed-info-container profile-container">
						<div className="profile-hero">
							<div>
								<div className="profile-eyebrow">passenger profile</div>
								<div className="profile-title">Профиль пассажира</div>
								<div className="profile-subtitle">Персональные данные, бонусный статус и история покупок в одном кабинете.</div>
							</div>
							<div className="profile-hero-chip">AeroDesk ID</div>
						</div>

						<div className="profile-dashboard-grid">
							<section className="profile-panel profile-user-panel">
								<div className="profile-panel-header">
									<div>
										<div className="profile-panel-title">Данные профиля</div>
										<div className="profile-panel-subtitle">Основная информация аккаунта</div>
									</div>
								</div>

								<UserInfo user={ user } />

								{ privilegeInfo &&
									<div className="profile-bonus-card">
										<div>
											<div className="profile-bonus-label">Бонусный счёт</div>
											<div className="profile-bonus-status">{ privilegeInfo.status }</div>
										</div>
										<div className="profile-bonus-balance">{ privilegeInfo.balance }</div>
									</div>
								}

								<Alert sx={{ fontSize: 16, borderRadius: 3 }} severity="info">
									Профиль используется для авторизации, покупки билетов и начисления бонусов.
								</Alert>
							</section>

							<section className="profile-panel profile-purchases-panel">
								<div className="profile-panel-header">
									<div>
										<div className="profile-panel-title">Список покупок</div>
										<div className="profile-panel-subtitle">Активные билеты, возвраты и совершённые поездки</div>
									</div>
									<div className="profile-count-chip">{ userInfo?.ticketsUnavailable ? "—" : (userInfo?.tickets.length ?? 0) }</div>
								</div>

								<ProfilePurchaseList tickets={ userInfo?.tickets ?? [] } unavailable={ userInfo?.ticketsUnavailable } message={ userInfo?.ticketsMessage } />
							</section>
						</div>

						{ privilegeInfo &&
							<section className="profile-panel profile-history-panel">
								<div className="profile-panel-header">
									<div>
										<div className="profile-panel-title">Бонусные операции</div>
										<div className="profile-panel-subtitle">Начисления и списания по билетам</div>
									</div>
								</div>
								<BalanceHistory 
									history={ privilegeInfo.history }
									selectDate={ selectDate }
									selectTime={ selectTime }
								/>
							</section>
						}
					</div>
				: <DataLoadError handleUpdate={ handleUpdateProfile } />
			}
		</>
	)
}
