'use client'

import React, { useEffect, useState, useActionState  } from "react";

async function submitAction(
  prevState: { message: string },
  formData: FormData,
  SetShowDetails:React.Dispatch<boolean>
) {
  const name = formData.get('name')
  const schedule = formData.get('schedule')
  const year = formData.get('year')
  const month = formData.get('month')
  const day = formData.get('day')

  // 模擬 API
  await new Promise(r => setTimeout(r, 500))
  console.log({
    name: name,
    schedule: schedule,
    date: `${year}-${month}-${day}`,
  })
  SetShowDetails(prev=>!prev)
  return  { message: '' }
}

export default function Home() {
  const[data,setData]=useState<number[][]>([[1,2,3,4,5,6,7],[8,9,10,11,12,13,14]])
  const[data2,setData2]=useState<string[]>(["日","一","二","三","四","五","六"])
  const fullData=[[],[],[],[],[],[]]
  const [showDetails,SetShowDetails]=useState<boolean>(false)
  const[scheduleData,setScheduleData]=useState("")
  const [scheduleDate, setScheduleDate] = useState<{
    year: number
    month: number
    day: number
  } | null>(null)
  const [currentYear, setCurrentYear] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(0)

  
  function HandleShowColumn(i:number,j:number)
  {
    // let data=fullData[i][j]
    const day = data[i][j]
    SetShowDetails(prev=>!prev)
    setScheduleData(`${i} ${j}`)
    setScheduleDate({
      year: currentYear,
      month: currentMonth,
      day
    })
  }
  
  useEffect(()=>{
    // time=Date.
    // setData(time)
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    setData(buildCalendar(year, month))
    setCurrentYear(year)
    setCurrentMonth(month)
  }, [])

  return (
    <div className="w-full min-h-screen h-screen flex justify-center">
      <div className="w-full pt-[50px] flex flex-col items-center">
        <Row data={data2}></Row>
        {Week(data,(i,j)=>HandleShowColumn(i,j))}
        {showDetails&& scheduleDate&&<Holder scheduleData={scheduleData} scheduleDate={scheduleDate} SetShowDetails={SetShowDetails}></Holder>}
      </div>
    </div>
  );
}

function Holder({scheduleData, scheduleDate,SetShowDetails}:{SetShowDetails:React.Dispatch<boolean>,scheduleData:string; scheduleDate:{ year: number; month: number; day: number }})
{
  const [state, action, isPending] = useActionState((prev,formdata:FormData)=>submitAction(prev,formdata,SetShowDetails)
  ,{ message: '' }
  )
  return(
    <div className="absolute w-[50%] bg-gray-400 h-[50vh] translate-x-[50%]" >
      {scheduleData}
      <p>
        {scheduleDate.year}/{scheduleDate.month}/{scheduleDate.day}
      </p>
      <form action={action}>
        <input type="hidden" name="year" value={scheduleDate.year} />
        <input type="hidden" name="month" value={scheduleDate.month} />
        <input type="hidden" name="day" value={scheduleDate.day} />

        <input name="name" placeholder="Name"/><br></br>
        <input name="schedule" placeholder="shedule" />

        <button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit'}
        </button>

      </form>
    </div>
  )
}

interface nameList{
  name:string,
  name2:string
}

function Row({data,HandleShowColumn}:{data:(number|string)[],HandleShowColumn?: (colIndex: number) => void})    
{
  
  return (
    <div className=" w-[50%] h-[10vh] bg-gray-300 flex col-auto">
      {ArrangeDate(data,(j)=>HandleShowColumn?.(j))}
    </div>
  )
}

function Colum({date,HandleShowColumn}:{date:number|string,HandleShowColumn:()=>void})
{
  
  return(
    <div className="border-2 border-black w-[50%] text-center" onClick={()=>HandleShowColumn()}>
      {date}
    </div>
  )
}

function ArrangeDate(date:(number|string)[],HandleShowColumn:(colIndex: number) => void)
{
  return date.map((val,index)=>{
    return val!==0? <Colum date={val} key={index} HandleShowColumn={()=>HandleShowColumn(index)}></Colum> :<Colum date={" "} key={index} HandleShowColumn={()=>HandleShowColumn(index)}></Colum>
  })
}

function Week(week:number[][],HandleShowColumn: (colIndex: number,rawIndex:number) => void)
{
  return week.map((val,index)=>{
    return <Row data={val} key={index} HandleShowColumn={(j)=>HandleShowColumn(index,j)}></Row>
  })
}

function buildCalendar(year: number, month: number): number[][] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  const calendar: number[] = []

  // 前面補空格
  for (let i = 0; i < firstDay; i++) {
    calendar.push(0)
  }

  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    calendar.push(d)
  }

  // 補齊到 7 的倍數
  while (calendar.length % 7 !== 0) {
    calendar.push(0)
  }

  // 切成二維
  const result: number[][] = []
  for (let i = 0; i < calendar.length; i += 7) {
    result.push(calendar.slice(i, i + 7))
  }

  return result
}
