import asyncio
import websockets
import json
import mysql.connector
from mysql.connector import Error

HOST = "0.0.0.0"
PORT = 8888

async def handler(websocket):
    print("Client connected")
    try:
        async for message in websocket:
            print(f"Received: {message}")
            await work_flow(json.loads(message),websocket)
            # await websocket.send(f"Echo: {message}")

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def work_flow(message:str,websocket):

    if message['flag']=='login':
        account=message['message']['account']
        password=message['message']['password']
        login_result=await login(account,password)
        print(json.dumps(login_result))
        await websocket.send(json.dumps(login_result))
        print(f"Login attempt with account: {account}, password: {password}")
    elif message['flag']=='logout':
        print("Logout attempt")
        print(message['message'])
        await websocket.send(json.dumps({'status':'success'}))
    elif message['flag']=='saveSchedule':
        schedule_data=message['message']['name']
        print(f"Saving schedule data: {message['message']}")
        await websocket.send(json.dumps({'status':'success'}))
    elif message['flag']=='getSchedule':
        await websocket.send(json.dumps({'scheduleList':[{'id': '1', 'title': '測試1', 'schedule': 'aaaaaaa', 'date': '2026-1-15', 'owner': 'me'}]}))
    elif message['flag']=='deleteSchedule':
        print(f"Deleting schedule data: {message['message']}")
        await websocket.send(json.dumps({'status':'success'}))

async def login(account:str,password:str):

    return {'status':'success','userName':'Test User'}

class ScheduleDB:
    def __init__(self, host, user, password, database):
        """
        初始化：設定資料庫連線資訊
        """
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database
        }

    def get_connection(self):
        """
        取得資料庫連線 (內部使用)
        """
        try:
            conn = mysql.connector.connect(**self.config)
            if conn.is_connected():
                return conn
        except Error as e:
            print(f"資料庫連線錯誤: {e}")
            return None
        
    def login(self, username, password):
        """
        驗證帳號密碼
        """
        conn = self.get_connection()
        if conn is None: return None

        try:
            cursor = conn.cursor(dictionary=True) 
            sql = "SELECT * FROM users WHERE username = %s AND password = %s"
            val = (username, password)
            
            cursor.execute(sql, val)
            result = cursor.fetchone() # 只抓第一筆 (因為帳號是唯一的)
            
            if result:
                print(f"登入成功: {username}")
                return result # 回傳使用者資料 (包含 id, username)
            else:
                print("登入失敗: 帳號或密碼錯誤")
                return None
                
        except Error as e:
            print(f"登入查詢錯誤: {e}")
            return None
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()

    def add_schedule(self, usern, schedule_name, schedule_detail, schedule_date):
        """
        新增行程
        """
        conn = self.get_connection()
        if conn is None: return False

        try:
            cursor = conn.cursor()
            sql = """
            INSERT INTO schedule (usern, schedule_name, schedule_detail, schedule_date) 
            VALUES (%s, %s, %s, %s)
            """
            val = (usern, schedule_name, schedule_detail, schedule_date)
            
            cursor.execute(sql, val)
            conn.commit()
            print(f"新增成功，ID: {cursor.lastrowid}")
            return cursor.lastrowid # 回傳新產生的 ID
        except Error as e:
            print(f"新增失敗: {e}")
            return False
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()

    def get_schedules(self, usern):
        """
        查詢某人的所有行程
        """
        conn = self.get_connection()
        if conn is None: return []

        try:
            # dictionary=True 讓回傳變成 [{'id':1, ...}, ...] 方便轉 JSON
            cursor = conn.cursor(dictionary=True)
            sql = "SELECT * FROM schedule WHERE usern = %s"
            val = (usern, )
            
            cursor.execute(sql, val)
            results = cursor.fetchall()
            return results
        except Error as e:
            print(f"查詢失敗: {e}")
            return []
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()

    def delete_schedule(self, schedule_id):
        """
        根據 ID 刪除行程
        """
        conn = self.get_connection()
        if conn is None: return False

        try:
            cursor = conn.cursor()
            sql = "DELETE FROM schedule WHERE id = %s"
            val = (schedule_id, )
            
            cursor.execute(sql, val)
            conn.commit()
            
            # rowcount 可以知道刪除了幾筆資料
            if cursor.rowcount > 0:
                print(f"成功刪除 ID {schedule_id}")
                return True
            else:
                print(f"找不到 ID {schedule_id}，刪除失敗")
                return False
        except Error as e:
            print(f"刪除失敗: {e}")
            return False
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()

async def main():
    async with websockets.serve(handler, HOST, PORT):
        print(f"WebSocket server started at ws://{HOST}:{PORT}")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
