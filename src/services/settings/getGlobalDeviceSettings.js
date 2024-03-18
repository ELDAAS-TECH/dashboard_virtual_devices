import axios from "axios";

const getGlobalDeviceSettings = async () => {
  const idToken = localStorage.getItem("idToken");
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getSettings`,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  };
  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default getGlobalDeviceSettings;
