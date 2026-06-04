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

function getPrivilegeStatusInfo(status?: string) {
	switch (status) {
		case "GOLD":
			return { label: "Золотой счёт", badge: "ЗОЛОТОЙ", description: "Максимальный уровень программы лояльности", className: "profile-bonus-tier-gold" };
		case "SILVER":
			return { label: "Серебряный счёт", badge: "СЕРЕБРЯНЫЙ", description: "Повышенный уровень программы лояльности", className: "profile-bonus-tier-silver" };
		case "BRONZE":
			return { label: "Бронзовый счёт", badge: "БРОНЗОВЫЙ", description: "Базовый уровень программы лояльности", className: "profile-bonus-tier-bronze" };
		default:
			return { label: "Стандартный счёт", badge: "STANDARD", description: "Участник программы лояльности", className: "profile-bonus-tier-standard" };
	}
}

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
								<div className="profile-subtitle">Персональные данные, бонусный счёт и история покупок в одном кабинете.</div>
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

								{ privilegeInfo && (() => {
									const tier = getPrivilegeStatusInfo(privilegeInfo.status);
									return (
										<div className={ `profile-bonus-card ${tier.className}` }>
											<div>
												<div className="profile-bonus-label">Бонусный счёт</div>
												<div className="profile-bonus-title">{ tier.label }</div>
												<div className="profile-bonus-description">{ tier.description }</div>
											</div>
											<div className="profile-bonus-meta">
												<div className="profile-bonus-tier">{ tier.badge }</div>
												<div className="profile-bonus-balance">{ privilegeInfo.balance }</div>
											</div>
										</div>
									);
								})()}

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
									<div className="profile-count-chip">{ userInfo?.tickets.length ?? 0 }</div>
								</div>

								<ProfilePurchaseList tickets={ userInfo?.tickets ?? [] } />
							</section>
						</div>

						{ privilegeInfo &&
							<section className="profile-panel profile-history-panel">
								<div className="profile-panel-header">
									<div>
										<div className="profile-panel-title">Бонусные операции</div>
										<div className="profile-panel-subtitle">Начисления и списания по билетам — отдельный блок ниже профиля и покупок</div>
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
