import asyncio
import websockets
import json
import pymysql
from pymysql import MySQLError, IntegrityError
import os

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db'),
    'user': os.getenv('DB_USER', 'app_user'),
    'password': os.getenv('DB_PASSWORD', 'app_password'),
    'database': os.getenv('DB_NAME', 'calander'),
    'charset': 'utf8mb4'
}

WS_HOST = "0.0.0.0"
WS_PORT = 8888


class Database:
    def __init__(self, config):
        self.config = config

    def get_connection(self):
        """ 取得資料庫連線 """
        try:
            return pymysql.connect(
                host=self.config['host'],
                user=self.config['user'],
                password=self.config['password'],
                database=self.config['database'],
                charset=self.config['charset'],
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False
            )
        except MySQLError as e:
            print(f"資料庫連線錯誤: {e}")
            return None
        
    def register(self, username, password, color):
        """ 使用者註冊 """
        conn = self.get_connection()
        if not conn: return {'status': 'error', 'msg': '資料庫連線失敗'}

        try:
            with conn.cursor() as cursor:
                # 這裡假設你的表名是 users
                sql = "INSERT INTO name (username, password, color) VALUES (%s, %s, %s)"
                cursor.execute(sql, (username, password, color))
                conn.commit()
                print(f"註冊成功: {username}")
                return {'status': 'success'}

        except IntegrityError as e:
            # 這是專門捕捉「重複帳號」的錯誤 (Error 1062)
            conn.rollback()
            print(f"註冊失敗(重複): {e}")
            return {'status': 'error', 'msg': '此帳號已被註冊'}
            
        except MySQLError as e:
            conn.rollback()
            print(f"註冊失敗(未知): {e}")
            return {'status': 'error', 'msg': '系統錯誤'}
            
        finally:
            conn.close()

    def login(self, username, password):
        """ 驗證登入 """
        conn = self.get_connection()
        if not conn:
            return None

        try:
            with conn.cursor() as cursor:
                sql = "SELECT * FROM name WHERE username=%s AND password=%s"
                cursor.execute(sql, (username, password))
                result = cursor.fetchone()
                if result:
                    print(f"登入成功: {username}")
                    return result
                else:
                    print(f"登入失敗: {username}")
                    return "沒有註冊"
                    
        except MySQLError as e:
            print(f"登入錯誤: {e}")
            return None
        finally:
            conn.close()

    def add_schedule(self, usern, name, detail, date):
        """ 新增行程 """
        conn = self.get_connection()
        if not conn:
            return False

        try:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO schedule (usern, schedule_name, schedule_detail, schedule_date)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(sql, (usern, name, detail, date))
                conn.commit()
                return cursor.lastrowid
        except MySQLError as e:
            conn.rollback()
            print(f"新增失敗: {e}")
            return False
        finally:
            conn.close()

    def get_schedules(self, usern):
        """ 取得行程 """
        conn = self.get_connection()
        if not conn:
            return []

        try:
            with conn.cursor() as cursor:
                # sql = "SELECT * FROM schedule WHERE usern=%s"
                sql = """
                SELECT s.*, u.color 
                FROM schedule s
                JOIN name u ON s.usern = u.username
                WHERE s.usern = %s
                """
                cursor.execute(sql, (usern,))
                return cursor.fetchall()
        except MySQLError as e:
            print(f"查詢失敗: {e}")
            return []
        finally:
            conn.close()
    def get_all_schedules(self): 
        conn = self.get_connection()
        if not conn: return []

        try:
            with conn.cursor() as cursor:
                # 2. 修改 SQL：拿掉 WHERE 子句
                sql = """
                SELECT s.*, u.color 
                FROM schedule s
                JOIN name u ON s.usern = u.username
                """
                cursor.execute(sql) 
                
                return cursor.fetchall()
                
        except MySQLError as e:
            print(f"查詢失敗: {e}")
            return []
        finally:
            conn.close()

    def delete_schedule(self, schedule_id, usern):
        """ 刪除行程 """
        conn = self.get_connection()
        if not conn:
            return False

        try:
            with conn.cursor() as cursor:
                sql = "DELETE FROM schedule WHERE id=%s AND usern=%s"
                cursor.execute(sql, (schedule_id, usern))
                conn.commit()
                # return cursor.rowcount > 0
                if cursor.rowcount > 0:
                    print(f"成功刪除 ID: {schedule_id}")
                    return True
                else:
                    print(f"刪除失敗 (權限不足或ID不存在)")
                    return False
        except MySQLError as e:
            conn.rollback()
            print(f"刪除失敗: {e}")
            return False
        finally:
            conn.close()


class WS:
    def __init__(self, host, port):
        self.host = host
        self.port = port

    async def start_server(self, handler):
        print(f"WebSocket server started at ws://{self.host}:{self.port}")
        async with websockets.serve(handler, self.host, self.port):
            await asyncio.Future()


class Context:
    def __init__(self):
        self.database = Database(DB_CONFIG)
        self.ws = WS(WS_HOST, WS_PORT)

    async def handle_connection(self, websocket):
        print("Client connected")
        try:
            async for message in websocket:
                data = json.loads(message)
                response = await self.process_logic(data)
                await websocket.send(json.dumps(response, default=str))
        except websockets.exceptions.ConnectionClosed:
            print("Client disconnected")

    async def process_logic(self, data):
        flag = data.get('flag')
        msg = data.get('message')

        if flag == 'register':
            account = msg.get('account')
            password = msg.get('password')
            gender = msg.get('gender')

            if not account or not password or not gender:
                return {'status': 'error', 'message': 'Account and password required'}

            result = self.database.register(account, password, gender)
            
            if result['status'] == 'success':
                return {'status': 'success'}
            else:
                return {'status': 'error', 'message': result['msg']}

        if flag == 'login':
            user = self.database.login(msg['account'], msg['password'])
            return {'status': 'success', 'data': user} if user else {'status': 'error'}

        if flag == 'saveSchedule':
            new_id = self.database.add_schedule(
                msg['owner'],
                msg['name'],
                msg['schedule'],
                f"{msg['year']}-{msg['month']}-{msg['day']}"
            )
            return {'status': 'success', 'id': new_id}

        if flag == 'getSchedule':
            print(msg)
            schedules = self.database.get_all_schedules()
            return {'status': 'success', 'scheduleList': schedules}

        if flag == 'deleteSchedule':
            schedule_id = msg.get('id')
            owner = msg.get('owner')
            ok = self.database.delete_schedule(schedule_id, owner)
            return {'status': 'success' if ok else 'error'}

        return {'status': 'error', 'message': 'Unknown flag'}

    async def flow(self):
        await self.ws.start_server(self.handle_connection)


def main():
    ctx = Context()
    try:
        asyncio.run(ctx.flow())
    except KeyboardInterrupt:
        print("Server stopped")

if __name__ == "__main__":
    main()
