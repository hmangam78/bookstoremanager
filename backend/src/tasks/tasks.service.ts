import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.entity';
import { v4 } from 'uuid';
import { UpdateTaskDTO } from './dto/task.dto';

@Injectable()
export class TasksService {

    private tasks = [
        {
            id: '1',
            title: 'first task',
            description: 'some task',
            status: TaskStatus.PENDING
        }
    ];

    getAllTasks() {
        return this.tasks;
    }

    createTask(title: string, description: string) {
        const newTask = {
            id: v4(),
            title,
            description,
            status: TaskStatus.PENDING
        }
        this.tasks.push(newTask);
        return newTask;
    }
    
    deleteTask(id: string) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }
    
    getTaskById(id: string) {
        return this.tasks.find((task) => task.id === id);
    }

    updateTask(id: string, updatedFields: any) {
        const taskToUpdate = this.getTaskById(id);
        if (taskToUpdate != undefined) {
            const newTask = Object.assign(taskToUpdate, updatedFields);
            this.tasks = this.tasks.map((task) => (task.id === id ? newTask : Task));
            return newTask;
        }
    }


    
}
