'use client'

import React, { useEffect, useState, useActionState  } from "react";

async function submitAction(
  prevState: { message: string },
  formData: FormData,
  SetShowDetails:React.Dispatch<React.SetStateAction<boolean>>
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
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)

  const[data,setData]=useState<number[][]>([[1,2,3,4,5,6,7],[8,9,10,11,12,13,14]])
  const[data2,setData2]=useState<string[]>(["日","一","二","三","四","五","六"])

  const [showDetails,SetShowDetails]=useState<boolean>(false)
  const[scheduleData,setScheduleData]=useState("")
  const [scheduleDate, setScheduleDate] = useState<{
    year: number
    month: number
    day: number
  } | null>(null)
  
  const [showLogin, setShowLogin] = useState<boolean>(false)
  const [isLogin, setIsLogin] = useState<boolean>(false)

  const handleLoginSuccess = () => {
    console.log("收到登入成功訊號，更新狀態...");
    setIsLogin(true)
    setShowLogin(false)
  }
  const handleSignOut = () => {
    setIsLogin(false)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1)
      setCurrentMonth(12)
    } 
    else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1)
      setCurrentMonth(1)
    } 
    else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  function HandleShowColumn(i:number,j:number)
  {
    const day = data[i][j]
    if (day === 0) return; // 空格不處理
    SetShowDetails(prev=>!prev)
    setScheduleData(`${i} ${j}`)
    setScheduleDate({
      year: currentYear,
      month: currentMonth,
      day
    })
  }
  
  useEffect(()=>{
    setData(buildCalendar(currentYear, currentMonth))
  }, [currentYear, currentMonth])

  return (
    <div className="w-full min-h-screen h-screen flex justify-center relative">
      <div className="absolute top-5 right-5">
        {isLogin ? (
          <button 
            onClick={handleSignOut} 
            className="px-6 py-2 bg-blue-700 text-white font-medium rounded-full shadow-md hover:bg-blue-300 transition-colors duration-200"
          >
            Sign Out
          </button>
        ) : (
          <button 
            onClick={() => setShowLogin(true)} 
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200"
          >
            Sign In
          </button>
        )}
      </div>
      <div className="w-full pt-[50px] flex flex-col items-center">
        <div className="flex items-center justify-between w-[50%] mb-4 px-4">
           <button 
             onClick={handlePrevMonth}
             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-bold"
           >
             &lt; 上個月
           </button>
           <div className="text-2xl font-bold text-gray-800">
             {currentYear} 年 {currentMonth} 月
           </div>
           <button 
             onClick={handleNextMonth}
             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-bold"
           >
             下個月 &gt;
           </button>
        </div>
        <Row data={data2}></Row>
        {Week(data,(i,j)=>HandleShowColumn(i,j))}
        {showDetails&& scheduleDate&&<Holder scheduleData={scheduleData} scheduleDate={scheduleDate} SetShowDetails={SetShowDetails}></Holder>}
        {showLogin&&<Login SignIn={()=>setShowLogin(false)} isLogin={handleLoginSuccess}></Login>}
      </div>
    </div>
  );
}

function Login({SignIn, isLogin}:{SignIn:()=>void, isLogin:()=>void})
{
  // 建立一個專門處理送出的函式
  const handleSubmit = (e: React.FormEvent) => {
    // 1. 【關鍵】阻止瀏覽器預設的送出行為 (這行會解決你的錯誤)
    e.preventDefault(); 
    
    // 2. 執行你的模擬登入邏輯
    console.log("執行登入...");
    isLogin(); // 更新父元件狀態 (變更為已登入)
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
      <div className="bg-white w-[90%] max-w-sm p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-gray-800">歡迎回來</div>
          <p className="text-sm text-gray-500 mt-2">請輸入您的帳號密碼以繼續</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input 
            name="account" 
            placeholder="Account" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 placeholder:text-gray-400"
          /><br></br>
          <input 
            name="password" 
            placeholder="Password" 
            type="password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 placeholder:text-gray-400"
          />
          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
          >
            Sign In
          </button>
          <button type="button" onClick={SignIn} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            X
          </button>
        </form>
      </div>
    </div>
  )
}

function Holder({scheduleData, scheduleDate, SetShowDetails}:
  {SetShowDetails:React.Dispatch<React.SetStateAction<boolean>>,scheduleData:string; scheduleDate:{ year: number; month: number; day: number }})
{
  const [state, action, isPending] = useActionState((prev: { message: string },formdata:FormData)=>submitAction(prev,formdata,SetShowDetails)
  ,{ message: '' }
  )
  return(
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 z-50" >
      {scheduleData}
      <div className="text-1xl font-bold text-gray-800 mt-2">
          {scheduleDate.year} 年 {scheduleDate.month} 月 {scheduleDate.day} 日
          <p className="text-sm text-gray-500 mt-1">新增您的行程規劃</p>
      </div>
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="year" value={scheduleDate.year} />
        <input type="hidden" name="month" value={scheduleDate.month} />
        <input type="hidden" name="day" value={scheduleDate.day} />

        <input 
          name="name" 
          placeholder="Name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
        /><br></br>
        <input 
          name="schedule" 
          placeholder="shedule" 
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
        />

        <button 
          type="submit" 
          disabled={isPending}
          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
        <button 
          type="button" 
          onClick={() => SetShowDetails(false)}
          className="text-sm text-gray-400 hover:text-gray-600 py-1"
        >
          取消
        </button>
      </form>
    </div>
  )
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
