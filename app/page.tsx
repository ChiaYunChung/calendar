'use client'

import React, { useEffect, useState, useActionState } from "react";

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
  usern: string;
  schedule_name:string;
  schedule_detail:string;
  schedule_date:string;
  color?:string;
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
  const [owner, setOwner] = useState<string>("");
  const [showRegister, setShowRegister] = useState<boolean>(false);

  useEffect(()=>{
    console.log("hflhbbhwab",owner)
  },[owner])

  const [events, setEvents] = useState<CalenderEvent[]>([])

  const [viewFilter, setViewFilter] = useState<string>('all');

  const [gender,setGender]=useState<string>("");

  const handleAddEvent = (event: CalenderEvent) => {
    console.log("新增行程:", event);
    setEvents(prevEvents => [...prevEvents, event])
    // console.log("hguunciu",events)
    SetShowDetails(false)
  }

  useEffect(() => {
  console.log("目前 events:", events)
  
}, [events])


  const handleDeleteEvent = async (id: string) => {
    const res = await fetch('/api/deleteSchedule', {
      method: 'POST', // 或是 'DELETE'，看你後端習慣
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          id: id, 
          owner:owner
        }), // 把要刪除的 ID 傳過去
    });
    const resJson=await res.json();
    console.log("刪除行程回應:", resJson.data.status);
    if(resJson.data.status==="success"){
      setEvents(prev => prev.filter(e => e.id !== id));
    }
    else{
      alert("刪除失敗，無權限刪除此行程");
    }
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
    if(isLogin)
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

  const signOut = async () => {
    const res=await fetch('/api/logout',{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({
        owner:owner,
      })
    });
    setIsLogin(false);
    window.location.reload();
  };

  return (
    <div className="w-full min-h-screen h-screen flex justify-center relative">
      <div className="absolute top-5 right-5">
        {isLogin ? (
          <button
          type="button"
            onClick={signOut}
            className="px-6 py-2 bg-blue-700 text-white font-medium rounded-full shadow-md hover:bg-blue-300 transition-colors duration-200"
          >
            Sign Out
          </button>
        ) : (
          <button 
          type="button"
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
          isActive={viewFilter === 'male'}
          onClick={() => setViewFilter('male')}
          activeColor={gender==='male'?`bg-blue-500`:'bg-pink-500'}
        />
        <FilterCheckbox 
          label="只看對方" 
          isActive={viewFilter === 'female'} 
          onClick={() => setViewFilter('female')}
          activeColor={gender==='male'?`bg-pink-500`:'bg-blue-500'}
        />
      </div>
      <div className="w-full pt-[50px] flex flex-col items-center">
        <div className="flex items-center justify-between w-[50%] mb-4 px-4">
           <button 
           type="button"
             onClick={handlePrevMonth}
             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-bold"
           >
             &lt; 上個月
           </button>
           <div className="text-2xl font-bold text-gray-800">
             {currentYear} 年 {currentMonth} 月
           </div>
           <button 
           type="button"
             onClick={handleNextMonth}
             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-bold"
           >
             下個月 &gt;
           </button>
        </div>
        <Row gender={gender} data={data2}></Row>
        {Week(gender,data,(i,j)=>HandleShowColumn(i,j), events, currentYear, currentMonth, viewFilter)}
        {showDetails&& scheduleDate&&<Holder scheduleData={scheduleData} scheduleDate={scheduleDate} SetShowDetails={SetShowDetails} 
        onAddEvent={handleAddEvent} events={events} onDeletEvent={handleDeleteEvent} owner={owner} gender={gender}></Holder>}
        {showLogin&&<Login setGender={setGender} setIsLogin={(status)=>setIsLogin(status)} setShowLogin={(e)=>setShowLogin(e)} 
        setOwner={(e)=>setOwner(e)} setEvents={setEvents} setShowRegister={setShowRegister}></Login>}
        {showRegister&&<Register setShowRegister={setShowRegister} setShowLogin={setShowLogin}></Register>}
      </div>
    </div>
  );
}

function Register({setShowRegister, setShowLogin}: 
  {setShowRegister:React.Dispatch<React.SetStateAction<boolean>>, setShowLogin:React.Dispatch<React.SetStateAction<boolean>>}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: (e.currentTarget as HTMLFormElement).account.value,
        password: (e.currentTarget as HTMLFormElement).password.value,
        gender: (e.currentTarget as HTMLFormElement).gender.value,
      })
    });
    const json=await res.json();
    console.log("註冊回應:", json.data.status);
    setShowRegister(false);
    setShowLogin(false);
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
      <div className="bg-white w-[90%] max-w-sm p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-gray-800">註冊新帳號</div>
          <p className="text-sm text-gray-500 mt-2">請輸入您的帳號密碼以註冊</p>
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
          <div>
          <input
            type="radio"
            name="gender"
            value="male"
            className="mr-2"
            />
          男性
          <input
            type="radio"
            name="gender"
            value="female"
            className="mr-2"
          />
          女性
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
            >
            Register
          </button>
        </form>
        <button
        type="button"
          onClick={() => { setShowLogin(false); setShowRegister(false); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          X
        </button>
      </div>
    </div>
    )
  }

function FilterCheckbox({ label, isActive, onClick, activeColor }:
  { label: string; isActive: boolean; onClick: () => void; activeColor: string }) {
  return (
    <button
    type="button"
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

function Login({setGender,setIsLogin, setShowLogin, setOwner, setEvents, setShowRegister}:
  {setGender:React.Dispatch<React.SetStateAction<string>>,setIsLogin:React.Dispatch<React.SetStateAction<boolean>>,setShowLogin:React.Dispatch<React.SetStateAction<boolean>>,
    setOwner:React.Dispatch<React.SetStateAction<string>>, setEvents:React.Dispatch<React.SetStateAction<CalenderEvent[]>>,
  setShowRegister:React.Dispatch<React.SetStateAction<boolean>>})
{
  // 建立一個專門處理送出的函式
  const handleSubmit = async (e: React.FormEvent) => {
    // 1. 【關鍵】阻止瀏覽器預設的送出行為 (這行會解決你的錯誤)
    e.preventDefault(); 
    const res=await fetch('/api/login',{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({
        account:(e.currentTarget as HTMLFormElement).account.value,
        password:(e.currentTarget as HTMLFormElement).password.value,
      })
    });
    console.log("登入回應:", res);
    const json = await res.json();
    console.log(json.data);
    setIsLogin(true); // 更新父元件狀態 (變更為已登入)
    setOwner(json.data.data.username)
    setShowLogin(false)
    setGender(json.data.data.color)
    // console.log(`asdasdasd: ${json.data.data.color}`);
    // console.log(`asdasdasd: ${json.data.data}`);
    if(json.data.data==="沒有註冊"){
      alert("沒有註冊，請先註冊帳號");
      setIsLogin(false);
      setShowRegister(true);
      return;
    }
    else{
      const data=await fetch('/api/getSchedule',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({
          owner:json.data.data,
        })
      });
      const dataJson=await data.json();
      // setEvents((prev)=>[...prev,...dataJson.data.scheduleList])
      setEvents(dataJson.data.scheduleList)
      console.log("取得行程回應:", dataJson);
    }
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
          </form>
          <button
          type="button"
            onClick={() => setShowRegister(true)}
          >
            註冊帳號
          </button>
          <button 
          type="button"
            onClick={() => setShowLogin(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            X
          </button>
      </div>
    </div>
  )
}

function Holder({scheduleData, scheduleDate, SetShowDetails, onAddEvent, events, onDeletEvent, owner,gender}:
  {SetShowDetails:React.Dispatch<React.SetStateAction<boolean>>,scheduleData:string; 
    scheduleDate:{ year: number; month: number; day: number }; onAddEvent:(event: CalenderEvent) => void; events:CalenderEvent[];
    onDeletEvent:(id:string)=>void; owner:string,gender:string})
{
  const [state, action, isPending] = useActionState((prev: { message: string },formdata:FormData)=>submitAction(prev,formdata,SetShowDetails)
  ,{ message: '' }
  )
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateKey = `${scheduleDate.year}-${pad(scheduleDate.month)}-${pad(scheduleDate.day)}`;
  console.log("aaaaaaaaaa:", events);
  const todaysEvents = events.filter(e => e.schedule_date === dateKey);
  console.log("bbbbb:", todaysEvents);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const res = await fetch('/api/saveSchedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        schedule: formData.get('schedule'),
        year: formData.get('year'),
        month: formData.get('month'),
        day: formData.get('day'),
        owner: owner,
      })
    });
    console.log("儲存行程回應:", res);
    const json = await res.json();
    console.log(json.data.status);
    if(json.data.status==="success"){
      // 呼叫父元件的儲存工具
      onAddEvent({
        // id: Date.now().toString(), // 用時間當 ID
        id: json.data.id,
        schedule_name: formData.get('name') as string,
        schedule_detail: formData.get('schedule') as string,
        schedule_date: `${scheduleDate.year}-${pad(scheduleDate.month)}-${pad(scheduleDate.day)}`, // 產生 Key
        usern: owner,
        color: gender,
      });
    }
    console.log("bbbbbbbbbbbbbbbbbbbbbb:",json.data.color);
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
                  ${event.gender === 'male' ? 'border-l-blue-500' : ''}
                  ${event.gender === 'female' ? 'border-l-pink-500' : ''}
                  ${event.usern === 'both' ? 'border-l-purple-600' : ''}
                `}>
                  <div className="font-bold text-gray-800 text-sm pr-6">{event.schedule_name}</div>
                  {event.schedule_detail && (<div className="text-xs text-gray-600 mt-1">{event.schedule_detail}</div>)}
                  
                  {/* ★ 刪除按鈕 */}
                  <button 
                  type="button"
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

function Row({data, HandleShowColumn, events, year, month, viewFilter,gender}
  :{gender:string,data:(number|string)[],HandleShowColumn?: (colIndex: number) => void, events?:CalenderEvent[], year?:number, month?:number, viewFilter?:string})    
{
  
  return (
    <div className=" w-[50%] h-[10vh] bg-gray-300 flex col-auto">
      {ArrangeDate(gender,data,(j)=>HandleShowColumn?.(j), events, year, month, viewFilter)}
    </div>
  )
}

function Colum({date, HandleShowColumn, events, year, month, viewFilter,gender}
  :{date:number|string,HandleShowColumn:()=>void, events?:CalenderEvent[], year?:number, month?:number, viewFilter?:string,gender:String})
{
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  // const dateKey = `${year}-${month}-${date}`;
  const dateKey = `${year}-${pad(month || 0)}-${pad(Number(date))}`;
  const todaysEvents = events ? events.filter((e: any) => e.schedule_date === dateKey) : [];
  const visibleEvents = todaysEvents.filter((event: any) => {
    if (viewFilter === 'all') return true;
    if (viewFilter === 'male') return event.color ===gender ? true:false;
    if (viewFilter === 'female') return event.color !==gender ? true:false;

    return false;
  });
  return(
    <div className="border-2 border-black w-[50%] text-center" onClick={()=>HandleShowColumn()}>
      {date}
      <div className="flex gap-1 mt-1 flex-wrap justify-center w-full px-1">
        {visibleEvents.map((event: any) => (
          <div 
            key={event.id}
            title={event.schedule_name} // 滑鼠移過去顯示標題
            className={`w-2 h-2 rounded-full 
              ${event.color === 'male' ? 'bg-blue-500' : ''}
              ${event.color === 'female' ? 'bg-pink-500' : ''}
              ${event.color === 'both' ? 'bg-purple-600' : ''}
            `}
          />
        ))}
      </div>
    </div>
  )
}

function ArrangeDate(gender:string,date:(number|string)[], HandleShowColumn:(colIndex: number) => void, events?:CalenderEvent[], year?:number, month?:number, viewFilter?:string)
{
  return date.map((val,index)=>{
    return val!==0? <Colum gender={gender} date={val} key={index} HandleShowColumn={()=>HandleShowColumn(index)} events={events} year={year} month={month} viewFilter={viewFilter}></Colum> 
    :<Colum gender={gender} date={" "} key={index} HandleShowColumn={()=>HandleShowColumn(index)} events={events} year={year} month={month} viewFilter={viewFilter}></Colum>
  })
}

function Week(gender:string,week:number[][], HandleShowColumn: (colIndex: number,rawIndex:number) => void, 
events:CalenderEvent[], year:number, month:number, viewFilter:string)
{
  return week.map((val,index)=>{
    return <Row gender={gender} data={val} key={index} HandleShowColumn={(j)=>HandleShowColumn(index,j)} 
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
