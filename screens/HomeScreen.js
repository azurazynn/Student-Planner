import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { supabase } from '../utils/supabaseClient';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('deadline', { ascending: true });
    if (error) console.log(error);
    else setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Sign up a new user and add to users table
  const signUpUser = async () => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'demo@example.com',
      password: 'Password123'
    });
    if (authError) return console.log('Auth error:', authError);

    const { data, error } = await supabase.from('users').insert([
      {
        auth_id: authData.user.id,
        name: 'Robhie Sevilleno',
        student_id: '2024-02479',
        course: 'BS Information Systems',
        section: '2A',
        email: 'demo@example.com'
      }
    ]);
    if (error) console.log('Insert error:', error);
    else console.log('User added:', data);
  };

  // Add a new task
  const addTask = async () => {
    const { data, error } = await supabase.from('tasks').insert([
      {
        user_id: 'USER_ID', // replace with your Supabase user's id
        title: title,
        subject: 'IT 621',
        deadline: new Date().toISOString(),
        status: 'pending'
      }
    ]);
    if (error) console.log(error);
    else {
      console.log('Task added:', data);
      setTitle('');
      fetchTasks(); // refresh
    }
  };

  // Update task status
  const completeTask = async (id) => {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
    fetchTasks();
  };

  // Delete task
  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Button mode="contained" onPress={signUpUser}>Sign Up Demo User</Button>

      <TextInput
        label="New Task"
        value={title}
        onChangeText={setTitle}
        style={{ marginVertical: 10 }}
      />
      <Button mode="contained" onPress={addTask}>Add Task</Button>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, marginVertical: 5, borderWidth: 1 }}>
            <Text>{item.title} - {item.status}</Text>
            <Button onPress={() => completeTask(item.id)}>Complete</Button>
            <Button onPress={() => deleteTask(item.id)}>Delete</Button>
          </View>
        )}
      />
    </View>
  );
}