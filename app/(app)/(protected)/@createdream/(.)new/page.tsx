import { Modal } from "@/components/Modal";
import { NewDreamPageUI } from "../../new/page";

export default function NewDream() {
	return (
		<Modal title="New Dream" redirectTo="/dream/new">
			<NewDreamPageUI hideCancel />
		</Modal>
	);
}
