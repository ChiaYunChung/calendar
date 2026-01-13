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

interface CalenderEvent{
  id: string;
  title:string;
  schedule:string;
  date:string;
  owner: 'me' | 'partner' | 'both';
}

export default function Home() {
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)

  const [data,setData]=useState<number[][]>([[1,2,3,4,5,6,7],[8,9,10,11,12,13,14]])
  const [data2,setData2]=useState<string[]>(["日","一","二","三","四","五","六"])

  const [showDetails,SetShowDetails]=useState<boolean>(false)
  const [scheduleData,setScheduleData]=useState("")
  const [scheduleDate, setScheduleDate] = useState<{
    year: number
    month: number
    day: number
  } | null>(null)
  
  const [showLogin, setShowLogin] = useState<boolean>(false)
  const [isLogin, setIsLogin] = useState<boolean>(false)

  const [events, setEvents] = useState<CalenderEvent[]>([
    { id: '1', title: '測試1', schedule: 'aaaaaaa', date: '2026-1-15', owner: 'me' },
     { id: '2', title: '測試2', schedule: 'bbbbb', date: '2026-1-15', owner: 'partner' },
  ])
  const [viewFilter, setViewFilter] = useState<'all' | 'me' | 'partner'>('all');

  const handleAddEvent = (event: CalenderEvent) => {
    setEvents(prevEvents => [...prevEvents, event])
    SetShowDetails(false)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

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
      <div className="absolute top-5 left-5">
          <FilterCheckbox 
            label="顯示全部" 
            isActive={viewFilter === 'all'} 
            onClick={() => setViewFilter('all')}
            activeColor="bg-gray-600"
          />
          <FilterCheckbox 
            label="只看我" 
            isActive={viewFilter === 'me'} 
            onClick={() => setViewFilter('me')}
            activeColor="bg-blue-500"
          />
          <FilterCheckbox 
            label="只看對方" 
            isActive={viewFilter === 'partner'} 
            onClick={() => setViewFilter('partner')}
            activeColor="bg-pink-500"
          />
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
        {Week(data,(i,j)=>HandleShowColumn(i,j), events, currentYear, currentMonth, viewFilter)}
        {showDetails&& scheduleDate&&<Holder scheduleData={scheduleData} scheduleDate={scheduleDate} 
        SetShowDetails={SetShowDetails} onAddEvent={handleAddEvent} events={events} onDeletEvent={handleDeleteEvent}></Holder>}
        {showLogin&&<Login SignIn={()=>setShowLogin(false)} isLogin={handleLoginSuccess}></Login>}
      </div>
    </div>
  );
}

function FilterCheckbox({ label, isActive, onClick, activeColor }: { label: string; isActive: boolean; onClick: () => void; activeColor: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      {/* 方框與勾勾 */}
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
        isActive 
          ? `${activeColor} border-transparent` // 有選中：顯示顏色背景
          : 'border-gray-400 bg-white group-hover:border-gray-500' // 沒選中：白底灰框
      }`}>
        {/* SVG 勾勾圖示 (只有 isActive 為 true 時才顯示) */}
        <svg 
          className={`w-3.5 h-3.5 text-white transform transition-transform ${isActive ? 'scale-100' : 'scale-0'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* 文字標籤 */}
      <span className={`text-sm font-bold ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
        {label}
      </span>
    </button>
  )
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

function Holder({scheduleData, scheduleDate, SetShowDetails, onAddEvent, events, defaultOwner = 'me', onDeletEvent}:
  {SetShowDetails:React.Dispatch<React.SetStateAction<boolean>>,scheduleData:string; 
    scheduleDate:{ year: number; month: number; day: number }; onAddEvent:(event: CalenderEvent) => void; events:CalenderEvent[];
    defaultOwner?: 'me' | 'partner' | 'both'; onDeletEvent:(id:string)=>void;})
{
  const [state, action, isPending] = useActionState((prev: { message: string },formdata:FormData)=>submitAction(prev,formdata,SetShowDetails)
  ,{ message: '' }
  )
  const dateKey = `${scheduleDate.year}-${scheduleDate.month}-${scheduleDate.day}`;
  const todaysEvents = events.filter(e => e.date === dateKey);
  const [owner, setOwner] = useState<'me' | 'partner' | 'both'>(defaultOwner);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    // 呼叫父元件的儲存工具
    onAddEvent({
      id: Date.now().toString(), // 用時間當 ID
      title: formData.get('name') as string,
      schedule: formData.get('schedule') as string,
      date: `${scheduleDate.year}-${scheduleDate.month}-${scheduleDate.day}`, // 產生 Key
      owner: owner,
    });
  };
  return(
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 z-50" >
      {scheduleData}
      <div className="text-1xl font-bold text-gray-800 mt-2">
          {scheduleDate.year} 年 {scheduleDate.month} 月 {scheduleDate.day} 日
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">今日行程 ({todaysEvents.length})</h3>
        
          {todaysEvents.length === 0 ? (
            <p className="text-gray-400 text-sm italic bg-gray-50 p-3 rounded text-center">目前沒有任何行程</p>
          ) : (
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {todaysEvents.map((event: any) => (
                <div key={event.id} className={`relative border-l-4 p-3 rounded shadow-sm bg-white border border-gray-100
                  ${event.owner === 'me' ? 'border-l-blue-500' : ''}
                  ${event.owner === 'partner' ? 'border-l-pink-500' : ''}
                  ${event.owner === 'both' ? 'border-l-purple-600' : ''}
                `}>
                  <div className="font-bold text-gray-800 text-sm pr-6">{event.title}</div>
                  {event.schedule && (<div className="text-xs text-gray-600 mt-1">{event.schedule}</div>)}
                  
                  {/* ★ 刪除按鈕 */}
                  <button 
                    onClick={() => onDeletEvent(event.id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"
                    title="刪除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">新增您的行程規劃</p>
      </div>
      <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2 ml-1">這是誰的行程？</label>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {/* 按鈕: 我 */}
            <button
              type="button" // 重要！一定要加 type="button" 避免變成 submit
              onClick={() => setOwner('me')}
              className={`flex-1 py-2 rounded text-sm font-bold transition-all ${
                owner === 'me' ? 'bg-white text-blue-600 shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              我
            </button>
            
            {/* 按鈕: 對方 */}
            <button
              type="button"
              onClick={() => setOwner('partner')}
              className={`flex-1 py-2 rounded text-sm font-bold transition-all ${
                owner === 'partner' ? 'bg-white text-pink-500 shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              對方
            </button>

            {/* 按鈕: 共同 */}
            <button
              type="button"
              onClick={() => setOwner('both')}
              className={`flex-1 py-2 rounded text-sm font-bold transition-all ${
                owner === 'both' ? 'bg-white text-purple-600 shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              共同
            </button>
          </div>
        </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* action={action} */}
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

function Row({data, HandleShowColumn, events, year, month, viewFilter}
  :{data:(number|string)[],HandleShowColumn?: (colIndex: number) => void, events?:CalenderEvent[], year?:number, month?:number, viewFilter?:string})    
{
  
  return (
    <div className=" w-[50%] h-[10vh] bg-gray-300 flex col-auto">
      {ArrangeDate(data,(j)=>HandleShowColumn?.(j), events, year, month, viewFilter)}
    </div>
  )
}

function Colum({date, HandleShowColumn, events, year, month, viewFilter}
  :{date:number|string,HandleShowColumn:()=>void, events?:CalenderEvent[], year?:number, month?:number, viewFilter?:string})
{
  const dateKey = `${year}-${month}-${date}`;
  const todaysEvents = events ? events.filter((e: any) => e.date === dateKey) : [];
  const visibleEvents = todaysEvents.filter((event: any) => {
    if (viewFilter === 'all') return true;
    if (viewFilter === 'me') return event.owner === 'me' || event.owner === 'both';
    if (viewFilter === 'partner') return event.owner === 'partner' || event.owner === 'both';
    return false;
  });
  return(
    <div className="border-2 border-black w-[50%] text-center" onClick={()=>HandleShowColumn()}>
      {date}
      <div className="flex gap-1 mt-1 flex-wrap justify-center w-full px-1">
        {visibleEvents.map((event: any) => (
          <div 
            key={event.id}
            title={event.title} // 滑鼠移過去顯示標題
            className={`w-2 h-2 rounded-full 
              ${event.owner === 'me' ? 'bg-blue-500' : ''}
              ${event.owner === 'partner' ? 'bg-pink-500' : ''}
              ${event.owner === 'both' ? 'bg-purple-600' : ''}
            `}
          />
        ))}
      </div>
    </div>
  )
}

function ArrangeDate(date:(number|string)[], HandleShowColumn:(colIndex: number) => void, events?:CalenderEvent[], year?:number, month?:number, viewFilter?:string)
{
  return date.map((val,index)=>{
    return val!==0? <Colum date={val} key={index} HandleShowColumn={()=>HandleShowColumn(index)} events={events} year={year} month={month} viewFilter={viewFilter}></Colum> 
    :<Colum date={" "} key={index} HandleShowColumn={()=>HandleShowColumn(index)} events={events} year={year} month={month} viewFilter={viewFilter}></Colum>
  })
}

function Week(week:number[][], HandleShowColumn: (colIndex: number,rawIndex:number) => void, 
events:CalenderEvent[], year:number, month:number, viewFilter:string)
{
  return week.map((val,index)=>{
    return <Row data={val} key={index} HandleShowColumn={(j)=>HandleShowColumn(index,j)} 
    events={events} year={year} month={month} viewFilter={viewFilter}></Row>
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
