import { useParams } from "react-router-dom";

function TruckRoutesManage() {
  const params = useParams();
  return (<p>Editing {params['id']}</p>)
}

export default TruckRoutesManage;