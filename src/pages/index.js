import {
  ActionIcon,
  Select,
  Text,
  Notification,
  Badge,
  Space,
  ColorSwatch,
  Group,
  useMantineTheme,
  Card,
  Menu,
  Popover,
  Button,
  Modal,
  Input,
  NumberInput,
  TextInput,
  MultiSelect,
  CheckIcon,
  rem,
  Progress,
} from "@mantine/core";
import ReactECharts from "echarts-for-react";
import {
  IconChevronDown,
  IconReceipt,
  IconHome,
  IconEgg,
  IconShoppingCart,
  IconBus,
  IconConfetti,
  IconBrandTinder,
  IconBrandNetflix,
  IconJumpRope,
  IconSwimming,
  IconCoin,
  IconBusinessplan,
  IconPlus,
  IconMinus,
  IconUser,
  IconDotsVertical,
  IconTick,
} from "@tabler/icons";
import { useState, useEffect, useRef } from "react";
import moment from "moment/moment";
import { useMutation, useQuery, useClient } from "urql";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";

const toTitleCase = (str) => {
  if (str)
    return str
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");

  return;
};

export default function Home() {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const graphqlClient = useClient();
  const router = useRouter();

  const [fp, setFP] = useState({ data: null, loading: true, error: null });

  const [openedNewTarget, setNewTargetState] = useState(false);
  const [openedNewCashIn, setNewCashInState] = useState(false);
  const [openedNewCashOut, setNewCashOutState] = useState(false);

  const [targetName, setTargetName] = useState("");
  const [targetAmount, setTargetAmount] = useState(null);
  const [targetReminder, setTargetReminder] = useState("DAILY");
  const [targetColor, setTargetColor] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);

  const [cashInAmount, setCashInAmount] = useState(0);
  const [cashInLoading, setCashInLoading] = useState(false);

  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [cashOutLoading, setCashOutLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const theme = useMantineTheme();

  const [chartOptions, setChartOptions] = useState({});
  const [chartOptionsDonut, setChartOptionsDonut] = useState({});

  const [openCategorization, setOpenCategorization] = useState(false);

  const [current, setCurrent] = useState(
    `${month[new Date().getMonth()]} ${new Date().getFullYear()}`
  );

  const monthsOptions = month.map((m) => `${m} ${new Date().getFullYear()}`);
  const tags = [
    "food",
    "shopping",
    "rent",
    "travel",
    "enjoyment",
    "date",
    "netflix",
    "gym",
    "swimming",
  ];

  const FETCH_FRONTPAGE = `
       query FETCH_FRONTPAGE(
          $account : ID!
      ){
        getFrontPage(account: $account){
          account{
            name
          }
          month
          year
          spend
          averageCashOut
          dailys{
            day
            CASH_IN
            CASH_OUT
          }
          recents{
            type
            id
            amount
            tags
            source{
              name
            }
            createdAt
          }
          savings{
            id
            name
            amount
            target
            color
            status
          }
        }
      }
  `;

  function toTitleCase(str) {
    return str.toLowerCase().replace(/(^|\s)\S/g, function (firstLetter) {
      return firstLetter.toUpperCase();
    });
  }

  useEffect(() => {
    graphqlClient
      .query(FETCH_FRONTPAGE, {
        account: "6419a969c8a000ac2edcf6af",
      })
      .toPromise()
      .then(({ data, error }) => {
        if (data) {
          console.log(data);
          const options = {
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow",
              },
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "3%",
              containLabel: true,
            },
            xAxis: [
              {
                data: data?.getFrontPage?.dailys
                  .map((transaction) => transaction.day)
                  .slice(0, 31),
                axisTick: {
                  alignWithLabel: true,
                },
                offset: 12,
                axisLine: {
                  show: false,
                },
                axisTick: {
                  show: false,
                },
              },
            ],
            yAxis: [
              {
                type: "value",
              },
            ],
            series: [
              {
                name: "Cash In",
                type: "bar",
                barWidth: 10,
                stack: "x",
                data: data?.getFrontPage?.dailys
                  .map((transaction) => transaction.CASH_IN)
                  .map((item) => {
                    return {
                      value: item,
                      itemStyle: {
                        color: "teal",
                      },
                    };
                  })
                  .slice(0, 31),
              },
              {
                name: "Cash Out",
                type: "bar",
                stack: "x",
                barWidth: 10,
                data: data?.getFrontPage?.dailys
                  .map((transaction) => transaction.CASH_OUT)
                  .map((item) => {
                    return {
                      value: item,
                      itemStyle: {
                        color: "orange",
                        barBorderRadius:
                          item > 0 ? [100, 100, 0, 0] : [0, 0, 100, 100],
                      },
                    };
                  })
                  .slice(0.31),
              },
            ],
          };

          setChartOptions(options);
          // Render data
          setFP({
            data,
            error: null,
            loading: false,
          });

          // Set expenditure options
          const getSeriesData = () => {
            const tagTotals = data?.getFrontPage?.recents
              .filter(
                (tx) =>
                  new Date(Number(tx.createdAt)).getMonth() ==
                    new Date().getMonth() &&
                  new Date(Number(tx.createdAt)).getFullYear() ==
                    new Date().getFullYear()
              )
              .reduce((acc, transaction) => {
                transaction?.tags?.forEach((tag) => {
                  if (!acc[tag]) {
                    acc[tag] = 0;
                  }
                  acc[tag] += transaction.amount;
                });
                return acc;
              }, {});

            const tagAmounts = Object.keys(tagTotals).map((tag) => ({
              name: toTitleCase(tag),
              value: tagTotals[tag],
            }));

            return tagAmounts;
          };

          console.log(getSeriesData());

          const optionsDonut = {
            tooltip: {
              trigger: "item",
            },
            legend: {
              top: "5%",
              left: "center",
              bottom: "20%",
              show: false,
            },
            series: [
              {
                name: "Expenditure on",
                type: "pie",
                radius: ["70%", "95%"],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
                label: {
                  show: false,
                  position: "center",
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 20,
                    fontWeight: "bold",
                  },
                },
                labelLine: {
                  show: false,
                },
                data: getSeriesData(),
              },
            ],
          };

          setChartOptionsDonut(optionsDonut);
        } else if (error) {
          setFP({
            data: null,
            error,
            loading: false,
          });
        }
      });
  }, []);

  // Requests

  const NEW_TARGET = `
      mutation NEW_TARGET(
        $name: String!
        $target: Int  
        $color: String
        $account: String
        $reminder: String
      ){
          newTarget(
              name: $name
              target: $target
              color: $color
              account: $account
              reminder: $reminder
          ){
              name
              amount
              target
              color
              status
          }
      } 
  `;
  const [newTargetRes, _newTarget] = useMutation(NEW_TARGET);

  const NEW_TRANSACTION = `
      mutation NEW_TRANSACTION(
        $amount: Int
        $tags: [String]
        $source: String
        $type: String
        $account: String    
      ){
        newTransaction(
          amount: $amount
          tags: $tags
          source: $source
          type: $type
          account: $account
        ){
          amount 
          tags
        }
      }
  `;

  const [newTransactionRes, _newTransaction] = useMutation(NEW_TRANSACTION);

  // Functions

  const handleCategorize = async () => {
    setOpenCategorization(true);
  };

  const handleNewTarget = () => {
    setTargetLoading(true);

    _newTarget({
      name: targetName,
      target: parseInt(targetAmount),
      color: targetColor,
      account: "6419a969c8a000ac2edcf6af",
      reminder: targetReminder,
    })
      .then(({ data, error }) => {
        if (data)
          return notifications.show({
            title: "Target created",
            message: "Start saving from the options menu on the tile",
            color: "teal",
          });
        if (error)
          return notifications.show({
            title: "Failed to create target",
            message: "Probably a problem with the server",
            color: "red",
          });
      })
      .catch((err) => {
        notifications.show({
          title: "Failed to create target",
          message: "Probably a problem with the server",
          color: "red",
        });
      })
      .finally(() => {
        setTargetLoading(false);
        setTargetName("");
        setTargetAmount(null);
        setTargetReminder("DAILY");
        setTargetColor(null);
        setNewTargetState(false);
        router.reload();
      });
  };

  const handleNewCashIn = () => {
    setCashInLoading(true);

    _newTransaction({
      amount: parseInt(cashInAmount),
      tags: null,
      source: null,
      type: "CASH_IN",
      account: "6419a969c8a000ac2edcf6af",
    })
      .then(({ data, error }) => {
        if (data)
          return notifications.show({
            title: "Success",
            message: `+ KSH. ${data?.newTransaction?.amount} cashed in successfully`,
            color: "teal",
          });

        if (error)
          return notifications.show({
            title: "Failed to transact",
            message: "Probably a problem with the server",
            color: "red",
          });
      })
      .catch(() => {
        return notifications.show({
          title: "Failed to transact",
          message: "Probably a problem with the server",
          color: "red",
        });
      })
      .finally(() => {
        setCashInLoading(false);
        setCashInAmount(0);
        setNewCashInState(false);
        router.reload();
      });
  };

  const handleNewCashOut = () => {
    setCashOutLoading(true);

    _newTransaction({
      amount: parseInt(cashOutAmount),
      tags: selectedTags,
      source: null,
      type: "CASH_OUT",
      account: "6419a969c8a000ac2edcf6af",
    })
      .then(({ data, error }) => {
        if (data)
          return notifications.show({
            title: "Success",
            message: `- KSH. ${data?.newTransaction?.amount} cashed out successfully`,
            color: "teal",
          });

        if (error)
          return notifications.show({
            title: "Failed to transact",
            message: "Probably a problem with the server",
            color: "red",
          });
      })
      .catch(() => {
        return notifications.show({
          title: "Failed to transact",
          message: "Probably a problem with the server",
          color: "red",
        });
      })
      .finally(() => {
        setCashOutLoading(false);
        setCashOutAmount(0);
        setSelectedTags([]);
        setNewCashOutState(false);
        router.reload();
      });
  };

  const swatches = Object.keys(theme.colors).map((color) => (
    <ColorSwatch
      component="button"
      key={color}
      onClick={() => setTargetColor(theme.colors[color][6])}
      color={theme.colors[color][6]}
    >
      {targetColor == theme.colors[color][6] && <CheckIcon width={rem(10)} />}
    </ColorSwatch>
  ));

  const { data, error, loading } = fp;

  if (loading) return <p>Loading data...</p>;

  if (error) return <p>Error loading data...</p>;

  return (
    <div className="relative h-[100vh]">
      <div className="p-6 relative max-h-[calc(100vh-85px)] overflow-y-auto">
        <Select
          placeholder="Pick one"
          rightSection={<IconChevronDown size="1rem" />}
          rightSectionWidth={30}
          w={"60%"}
          value={current}
          className="absolute top-12 left-[50%] translate-x-[-50%]"
          styles={{
            rightSection: { pointerEvents: "none" },
            outline: "none",
          }}
          onChange={setCurrent}
          data={monthsOptions}
        />

        <div className="flex justify-between mt-[100px]">
          {/* spend */}
          <div>
            <Text c="dimmed" fz="sm">
              Spend
            </Text>
            <Text
              c="black"
              fw={700}
              style={{ fontSize: "1.7rem" }}
              className="tracking-tight"
            >
              {data?.getFrontPage?.spend
                ? data?.getFrontPage?.spend
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KES"
                : "0 KES"}
            </Text>
          </div>

          {/* daily avg */}
          <div>
            <Text c="dimmed" fz="sm">
              Daily Avg.
            </Text>
            <Text
              c="black"
              fw={700}
              style={{ fontSize: "1.7rem" }}
              className="tracking-tight"
            >
              {data?.getFrontPage?.averageCashOut
                ? data?.getFrontPage?.averageCashOut
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KES"
                : "0 KES"}
            </Text>
          </div>
        </div>

        {/* Chart area */}
        <div className="min-h-[300px]">
          <ReactECharts option={chartOptions} />
          <Space h={30} />
          <Button
            fullWidth
            variant="subtle"
            color="teal"
            onClick={handleCategorize}
          >
            Show by Tags
          </Button>
          <Modal
            size="calc(100vw - 3rem)"
            opened={openCategorization}
            onClose={() => setOpenCategorization(false)}
            centered
            title={
              <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold w-full text-center">
                Expenditure by tags
              </h1>
            }
          >
            <ReactECharts option={chartOptionsDonut} />
          </Modal>
        </div>

        {/* Savings */}
        <div>
          <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold ">
            Savings
          </h1>
          <br />
          <div className="space-x-3 flex overflow-x-auto w-full h-[150px]">
            {data?.getFrontPage?.savings.map((saving) => (
              <Saving key={saving.id} data={saving} />
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <Space h={10} />
          <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold ">
            Recents
          </h1>
          <br />
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {data?.getFrontPage.recents.map((transaction) => (
              <Transaction key={transaction.id} data={transaction} />
            ))}
          </div>
        </div>
      </div>

      {/* New target modal */}
      <Modal
        opened={openedNewTarget}
        onClose={() => {
          setNewTargetState(false);
          setTargetName("");
          setTargetAmount(null);
          setTargetReminder("DAILY");
          setTargetColor(null);
        }}
        centered
        title={
          <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold w-full text-center">
            New Target
          </h1>
        }
      >
        <Space h={20} />
        <div className="space-y-4">
          <TextInput
            variant="filled"
            label="What are you saving for"
            placeholder="ex. Microwave"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
          />

          <input
            type="number"
            label="Target amount"
            placeholder="ex. 10,000"
            prefix="KSH."
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />

          <Select
            variant="filled"
            label="Reminder"
            placeholder=""
            onChange={setTargetReminder}
            value={targetReminder}
            data={["DAILY", "WEEKLY", "MONTHLY"]}
          />
          <Space h={10} />
          <Group position="center" spacing="xs">
            {swatches}
          </Group>

          <Space h={20} />
          <Button
            loading={targetLoading}
            color="teal"
            uppercase
            fullWidth
            onClick={handleNewTarget}
          >
            create target
          </Button>
        </div>
      </Modal>

      {/* New Cash In Modal */}
      <Modal
        opened={openedNewCashIn}
        onClose={() => setNewCashInState(false)}
        centered
        title={
          <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold w-full text-center">
            New Cash In
          </h1>
        }
      >
        <Space h={10} />
        <div className="space-y-4">
          <input
            type="number"
            label="Amount"
            placeholder="ex. 10,000"
            prefix="KSH."
            value={cashInAmount}
            onChange={(e) => setCashInAmount(e.target.value)}
          />
          {/* <NumberInput
            variant="filled"
            label="Amount"
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            hideControls
            placeholder="ex. 10,000"
            formatter={(value) =>
              !Number.isNaN(parseFloat(value))
                ? `KSH ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                : "KSH "
            }
          /> */}
          <Space h={10} />
          <Button
            color="teal"
            uppercase
            fullWidth
            loading={cashInLoading}
            onClick={handleNewCashIn}
          >
            cash in
          </Button>
        </div>
      </Modal>

      {/* New Cash Out Modal */}
      <Modal
        opened={openedNewCashOut}
        onClose={() => setNewCashOutState(false)}
        centered
        title={
          <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold w-full text-center">
            New Cash Out
          </h1>
        }
      >
        <Space h={20} />
        <div className="space-y-4">
          <input
            type="number"
            label="Amount"
            placeholder="ex. 10,000"
            prefix="KSH."
            value={cashOutAmount}
            onChange={(e) => setCashOutAmount(e.target.value)}
          />
          {/* <NumberInput
            variant="filled"
            label="Amount"
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            hideControls
            placeholder="ex. 10,000"
            formatter={(value) =>
              !Number.isNaN(parseFloat(value))
                ? `KSH ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                : "KSH "
            }
          /> */}
          <MultiSelect
            label="Expenditure tags"
            data={tags}
            placeholder="ex. Shopping"
            searchable
            dropdownPosition="bottom"
            onChange={setSelectedTags}
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const item = { value: query, label: query };
              setSelectedTags((current) => [...current, item]);
              return item;
            }}
          />
          <Space h={20} />
          <Button
            color="teal"
            uppercase
            fullWidth
            loading={cashOutLoading}
            onClick={handleNewCashOut}
          >
            cash out
          </Button>
        </div>
      </Modal>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 w-full bg-white flex px-12 py-4 justify-evenly items-baseline shadow-md">
        <ActionIcon color="teal" onClick={() => setNewTargetState(true)}>
          <IconBusinessplan size="2rem" />
        </ActionIcon>

        <ActionIcon
          color="teal"
          variant="filled"
          w={48}
          h={48}
          onClick={() => setNewCashInState(true)}
        >
          <IconPlus size="2rem" />
        </ActionIcon>

        <ActionIcon
          color="teal"
          variant="filled"
          w={48}
          h={48}
          onClick={() => setNewCashOutState(true)}
        >
          <IconMinus size="2rem" />
        </ActionIcon>

        <ActionIcon color="teal">
          <IconUser size="2rem" />
        </ActionIcon>
      </div>
    </div>
  );
}

const Transaction = ({ data }) => {
  return (
    <div className="shadow p-3">
      <div className="flex justify-between min-h-[60px]">
        <div className="flex space-x-4 w-[65%]">
          <div className="min-w-[56px] min-h-[56px]">
            <ActionIcon
              color={data?.type == "CASH_IN" ? "green" : "red"}
              variant="light"
              w={56}
              h={56}
              p={0}
            >
              {data.tags && data.tags[0] == "rent" ? (
                <IconHome />
              ) : data.tags && data.tags[0] == "food" ? (
                <svg
                  width="24"
                  height="24"
                  fill={data?.type == "CASH_IN" ? "green" : "red"}
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d="M20.671 12.989c-1.201-.751-1.714-.465-2.224.29-.799 1.19-1.735 1.374-3.043.796-.768-.339-1.073-.37-1.817.393-1.164 1.197-2.356 1.161-3.495-.042-.561-.594-.874-.787-1.66-.413-.366.175-.867.416-1.594.19-.791-.244-1.07-.785-1.273-1.18-.454-.877-1.273-.823-2.081-.285-.608.403-1.211-.51-.613-.913 1-.676 2.767-1.059 3.671.693.324.628.671.859 1.416.503 1.223-.587 2.049-.286 2.934.649.689.727 1.138.821 1.907.031 1.059-1.09 1.855-1.157 3.049-.633.795.353 1.173.362 1.686-.403 1.04-1.54 2.536-1.501 3.795-.557.584.437-.078 1.318-.658.881m-8.67 7.011c-5.411 0-9.001-2.207-9.001-3.667 0-.999 1.18-1.629 2.163-1.195 1 .437 3.331 1.862 6.837 1.862 3.139 0 4.862-.652 6.441-1.63 1.347-.838 2.559-.025 2.559.966 0 1.278-3.091 3.664-8.999 3.664m11.999-7.248c0-2.103-1.665-3.749-3.792-3.749-2.255.054-3.888 2.748-8.243 2.748-4.727 0-5.878-3.129-8.743-2.714-1.837.263-3.222 1.858-3.222 3.713 0 .956.445 1.821 1.175 2.587-1.215 3.623 4.246 6.663 10.826 6.663 6.807 0 11.948-3.142 10.83-6.651.726-.764 1.169-1.632 1.169-2.597m-14.03-2.752c3.384-3.229-.712-3.545.093-5.828-2.834 3.184 1.021 3.268-.093 5.828m2.983-.001c5.084-4.88-1.051-4.622.126-7.999-4.058 4.362 1.512 4.459-.126 7.999" />
                </svg>
              ) : data.tags && data.tags[0] == "shopping" ? (
                <IconShoppingCart />
              ) : data.tags && data.tags[0] == "travel" ? (
                <IconBus />
              ) : data.tags && data.tags[0] == "enjoyment" ? (
                <IconConfetti />
              ) : data.tags && data.tags[0] == "date" ? (
                <IconBrandTinder />
              ) : data.tags && data.tags[0] == "netflix" ? (
                <IconBrandNetflix />
              ) : data.tags && data.tags[0] == "gym" ? (
                <IconJumpRope />
              ) : data.tags && data.tags[0] == "swimming" ? (
                <IconSwimming />
              ) : data?.type == "CASH_IN" ? (
                <svg
                  id="Layer_1"
                  width="24"
                  height="24"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke={data?.type == "CASH_IN" ? "green" : "red"}
                  viewBox="0 0 122.88 91.98"
                >
                  <title>deposit</title>
                  <path d="M103.85,57.91a2.47,2.47,0,0,1,2.27,1.5l16.47,28.94c.45.87.25,2.62.23,3.63H.05l0-2.5a2.47,2.47,0,0,1,.37-1.27l16.7-29a2.45,2.45,0,0,1,2.17-1.31H50L43.21,46.19a12.27,12.27,0,0,1-1.07-1.54L41.08,42.8h0a1.5,1.5,0,0,1-.31.24l-1.76,1-.31.14a4.93,4.93,0,0,1-5.84-1.3,1.6,1.6,0,0,1-.47.43l-1.76,1a1.69,1.69,0,0,1-.31.13,5,5,0,0,1-6.15-1.64A1,1,0,0,1,24,43l-1.76,1-.31.14c-5.26,2-8-2.8-10.16-6.7l-.59-1L8.52,32l-.08-.14C6.42,28,6.5,24.63,6.59,20.79c0-.65,0-1.3,0-2.21,0,0,0,0,0-.06A12.51,12.51,0,0,1,7.68,13.1,8.08,8.08,0,0,1,11,9.49L26.18.7A4.61,4.61,0,0,1,30.85.57a11.76,11.76,0,0,1,3.92,3.54l17.31,8.07.07,0c.22.1.46.2.72.33L60.71,8,89.53,57.91ZM51,48.84,60,64.58a5.05,5.05,0,0,1,6.91,1.85l11.73-6.77a5.07,5.07,0,0,1,1.85-6.91L61.7,20.14a5.08,5.08,0,0,1-6.92-1.85l-9,5.21.36.61L53.44,36.8a10.44,10.44,0,0,1,2.77-2.32,10.08,10.08,0,1,1-3.68,13.77l-.07-.12-.28.16a6.16,6.16,0,0,1-1.23.55ZM42.78,18.35,49,14.74,32.93,8a1.39,1.39,0,0,1-.55-.46,10.19,10.19,0,0,0-3.07-3,1.85,1.85,0,0,0-1.9,0L12.83,13a5.21,5.21,0,0,0-2.11,2.34c-.53,1.1-.37,2.25-.37,3.92a.31.31,0,0,1,0,.09c0,.63,0,1.45,0,2.24-.08,3.43-.52,5.4,1.15,8.64l2.6,4.29a.57.57,0,0,1,.12.18c0,.06.27.47.58,1,1.63,2.89,3.63,6.47,6.52,5.39l1.29-.75c-.45-.82-.88-1.67-1.29-2.49s-.71-1.45-1.09-2.1a1.46,1.46,0,1,1,2.53-1.47c.38.66.78,1.45,1.19,2.27,1.4,2.81,3,6,5.37,5.16l1.68-1a2.71,2.71,0,0,1,.3-.13c-.58-1-1.11-2-1.61-3-.37-.74-.71-1.44-1.09-2.1A1.46,1.46,0,1,1,31.1,34c.38.65.77,1.45,1.19,2.27,1.39,2.8,3,6,5.36,5.16l1.69-1a1.25,1.25,0,0,1,.36-.15L36.85,35.4a1.46,1.46,0,0,1,2.53-1.47l5.35,9.26c1.28,2.22,3,3.11,4.5,3a3.33,3.33,0,0,0,1.51-.45,3,3,0,0,0,.64-.48h0c0-.12.11-.18.24-.25a2.33,2.33,0,0,0,.27-.35,4.79,4.79,0,0,0,0-4.71l0-.08c-.1-.21-.22-.43-.34-.65L40.35,20a1.47,1.47,0,0,1,2.43-1.64Zm10,44.49H20.72L6.54,87H116.38l-14-24.2H85.17L68.79,72.3H83.91a2.47,2.47,0,1,1,0,4.93H42.57a2.46,2.46,0,1,1,0-4.91H58.29l-5.47-9.46Z" />
                </svg>
              ) : (
                <IconReceipt />
              )}
            </ActionIcon>
          </div>

          <div className="w-full">
            <Text fw={700} fz="md">
              {data?.tags ? toTitleCase(data?.tags[0]) : "CASH IN"}
            </Text>
            <div className="space-x-1 mt-2  flex overflow-x-auto w-full">
              {data?.tags &&
                data.tags.map((tag, i) => (
                  <Badge key={i} color="teal" size="xs">
                    {toTitleCase(tag)}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        <div>
          <Text c={data?.type == "CASH_IN" ? "green" : "red"} fz="lg" fw={700}>
            {data?.type == "CASH_IN"
              ? `KSH ${(data?.amount)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
              : ` -KSH ${(data?.amount)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
          </Text>
          <Text c="dimmed" fz="sm" style={{ textAlign: "right" }}>
            {moment(new Date(parseInt(data?.createdAt))).format("DD ddd")}
          </Text>
        </div>
      </div>
    </div>
  );
};

const Saving = ({ data }) => {
  const [topUpState, setTopUpState] = useState(false);
  const [editState, setEditState] = useState(false);

  return (
    <div style={{ minWidth: 250, position: "relative" }}>
      {/* Top Up Modal */}
      <Modal
        opened={topUpState}
        onClose={() => setTopUpState(false)}
        centered
        title={
          <h1 className="text-[1.3rem] pl-0 tracking-tight p-2 font-bold w-full text-center">
            Top Up
          </h1>
        }
      >
        <Space h={10} />
        <div className="space-y-4">
          <NumberInput
            variant="filled"
            label="Amount"
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            hideControls
            placeholder="ex. 10,000"
            formatter={(value) =>
              !Number.isNaN(parseFloat(value))
                ? `KSH ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                : "KSH "
            }
          />
          <Space h={10} />
          <Button color="teal" uppercase fullWidth>
            Top Up
          </Button>
        </div>
      </Modal>

      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <span className="flex w-full justify-between">
          <Text c={data?.color} fw={700}>
            {data?.name}
          </Text>
        </span>
        <span className="flex items-baseline space-x-2 mt-2">
          <Text c="dimmed" fz="sm">
            KSH{" "}
            {(data?.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          </Text>
          <Text c="dimmed" fz="sm">
            /
          </Text>
          <Text c={data?.color} fz="sm">
            KSH{" "}
            {(data?.target).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          </Text>
        </span>
        <br />
        <Progress
          radius="xl"
          size={16}
          sections={[
            {
              value: ((data.amount / data.target) * 100).toFixed(0),
              color: data?.color,
              label: `${((data.amount / data.target) * 100).toFixed(0)}%`,
              tooltip: null,
            },
          ]}
        />
      </Card>
      <Menu
        shadow="md"
        position="left"
        width={100}
        style={{ zIndex: 99, position: "absolute", top: 12, right: 12 }}
      >
        <Menu.Target>
          <ActionIcon variant="subtle" color={data?.color}>
            <IconDotsVertical size="0.9rem" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Options</Menu.Label>
          <Menu.Item onClick={() => setTopUpState(true)}>Top up</Menu.Item>
          <Menu.Item>Expend</Menu.Item>
          <Menu.Item>Delete</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};
