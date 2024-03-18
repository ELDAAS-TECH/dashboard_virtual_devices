import { useMemo, useState, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import axios from "axios";
import { useRouter } from "next/router";
import DoneIcon from "@mui/icons-material/Done";
import { CircularProgress, Stack } from "@mui/material";

const Beaconlogtable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const idToken = localStorage.getItem("idToken");
        const { username, email } = router.query;

        if (!email) {
          console.error("Username not provided in the URL.");
          return;
        }
        const response = await axios.get(
          "https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers",
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        const user = response.data["AWS-result"].find((user) => user.email === email);

        if (!user) {
          console.error(`User with username ${username} not found.`);
          return;
        }

        const userId = user.sub;

        const secondApiResponse = await axios.post(
          `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getBeaconLogs/${userId}`,
          {
            user_id: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        const data = secondApiResponse.data;
        setData(data["logs"]);
        setLoading(false);
        data["logs"].forEach((log) => {
          const onoff = log.ON_OFF_Time;

          // Handle ON time
          const onPattern = /ON#(\d+)/;
          const onMatch = onoff?.match(onPattern);
          if (onMatch && onMatch[1] !== undefined) {
            const onTime = onMatch[1];
            log.onTime = onTime;
          }

          // Handle OFF time
          const offPattern = /OFF#(\d+)/;
          const offmatch = onoff?.match(offPattern);
          if (offmatch && offmatch[1] !== undefined) {
            const offTime = offmatch[1];
            log.offTime = offTime;
          }
        });

        data["logs"]?.forEach((log) => {
          const rgbstring = log.RGBValues;
          const rgbPattern = /([RGB])#(\d+)/g;
          let match;
          log.rgbValues = {
            R: 0,
            G: 0,
            B: 0,
          };

          while ((match = rgbPattern?.exec(rgbstring)) !== null) {
            const [, color, value] = match;
            log.rgbValues[color] = parseInt(value, 10);
          }

          const rgbString = `rgb(${log.rgbValues.R},${log.rgbValues.G},${log.rgbValues.B})`;
          log.rgbString = rgbString;
        });
        data["logs"].forEach((log) => {
          const dateTime = new Date(log.date_time);

          console.log(dateTime, "dateTime");
          const formattedDate = dateTime.toLocaleDateString();
          const formattedTime = dateTime.toLocaleTimeString();
          log.formattedDate = formattedDate;
          log.formattedTime = formattedTime;
        });
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const router = useRouter();

  const columns = useMemo(
    //column definitions...
    () => [
      {
        accessorKey: "formattedDate",
        header: "Date",
      },
      {
        accessorKey: "formattedTime",
        header: "Time",
        // sortType: customTimeSort,
      },
      {
        accessorKey: "device_id",
        header: "Device Id",
      },
      {
        accessorKey: "Device_name",
        header: "Device Name",
      },
      {
        accessorKey: "Operated_by",
        header: "Operated By",
      },

      {
        accessorKey: "Beacon",
        header: "Beacon",
      },
      {
        accessorKey: "Operation",
        header: "Operation",
      },
      {
        accessorKey: "Remarks",
        header: "Remarks",
      },
      {
        accessorKey: "LED_Brightness",
        header: "LED Brightness",
      },
      {
        accessorKey: "Charge_Control",
        header: "Charge Control",
      },
      {
        accessorKey: "rgbString",
        header: "RGB Values",
      },
      {
        accessorKey: "onTime",
        header: "On Time",
      },
      {
        accessorKey: "offTime",
        header: "Off Time",
      },
      {
        accessorKey: "Active_Duration",
        header: "Active Duartion",
      },
      {
        accessorKey: "Beacon_battery",
        header: "Beacon Battery",
      },
    ],
    []
    //end
  );

  // Custom sorting function for time with AM and PM
  function customTimeSort(rowA, rowB, desc) {
    const timeA = convertTimeTo24HourFormat(rowA.original.formattedTime);
    const timeB = convertTimeTo24HourFormat(rowB.original.formattedTime);

    if (timeA < timeB) {
      return desc ? 1 : -1;
    }
    if (timeA > timeB) {
      return desc ? -1 : 1;
    }
    return 0;
  }

  // Function to convert time to 24-hour format
  function convertTimeTo24HourFormat(timeString) {
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    if (period === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    } else if (period === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  const table = useMaterialReactTable({
    columns,
    data,
    enableExpandAll: false, //hide expand all double arrow in column header
    enableExpanding: false,
    filterFromLeafRows: true, //apply filtering to all rows instead of just parent rows
    initialState: { expanded: true }, //expand all rows by default
    paginateExpandedRows: false, //When rows are expanded, do not count sub-rows as number of rows on the page towards pagination
    enableFullScreenToggle: false,
    // muiTableBodyRowProps: ({ row }) => ({
    //     onClick: (event) => {
    //       handleRowClick(row);
    //     },
    //     sx: {
    //       cursor: 'pointer', //you might want to change the cursor too when adding an onClick
    //     },
    //   }),
  });

  return !loading ? (
    <MaterialReactTable table={table} />
  ) : (
    <Stack sx={{ justifyContent: "center", alignItems: "center", pt: "50px" }}>
      <CircularProgress />
    </Stack>
  );
};

export default Beaconlogtable;
