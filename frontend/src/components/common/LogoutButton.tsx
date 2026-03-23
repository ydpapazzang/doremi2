import { useNavigate } from "react-router-dom";
import { clearStoredSession } from "../../services/storage";
import { PrimaryButton } from "./PrimaryButton";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredSession();
    navigate("/", { replace: true });
  };

  return (
    <PrimaryButton type="button" onClick={handleLogout}>
      로그아웃
    </PrimaryButton>
  );
}
