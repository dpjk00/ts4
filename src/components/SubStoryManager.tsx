// src/components/SubStoryManager.tsx

import React, { useState, useEffect, ChangeEvent } from 'react';
import { SubStory, State, Priority, Time  } from '../models/SubStory';
import SubStoryService from '../services/SubStoryService';
import UserService from '../services/UserService';
import { User } from '../models/User';
import { Story } from '../models/Story';
import StoryService from '../services/StoryService';

interface SubStoryManagerProps {
  story: Story;
}

const SubStoryManager: React.FC<SubStoryManagerProps> = ({ story }) => {
  const [substories, setSubStories] = useState<SubStory[]>([]);
  const [newSubStory, setNewSubStory] = useState<Partial<SubStory>>({
    name: '',
    description: '',
    priority: Priority.LOW,
    story: story.id,
    expected_time: Time.,
    state: State.TODO,
    created: Date.now(),
    start: Date.now(),
    end: undefined,
    owner: undefined,
  });
  const [editingSubStory, setEditingSubStory] = useState<SubStory | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersNoAdmin, setNoAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    setSubStories(SubStoryService.get_substories_by_id(story.id));
    setUsers(UserService.get_users());
    setNoAdminUsers(UserService.get_users_no_admin());
  }, [story.id]);

  const handleSubStoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingSubStory) {
      setEditingSubStory(prevState => ({ ...prevState, [name]: value }));
    } else {
      setNewSubStory(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleAddSubStory = () => {
    const subStoryToAdd = new SubStory(
      Date.now(),
      newSubStory.name || '',
      newSubStory.description || '',
      newSubStory.priority,
      newSubStory.story,
      newSubStory.start,
      newSubStory.end,
      newSubStory.expected_time,
      newSubStory.created,
      newSubStory.state,
      newSubStory.owner
    );
    SubStoryService.add_substory(subStoryToAdd);
    setSubStories(SubStoryService.get_substories_by_id(story.id));
    setNewSubStory({
      name: '',
      description: '',
      priority: Priority.LOW,
      story: story.id,
      expected_time: Time.THREE,
      state: State.TODO,
      created: Date.now(),
      start: Date.now(),
      end: 0,
      owner: undefined,
    });
  };

  const handleDeleteSubStory = (id: number) => {
    SubStoryService.delete_substory(id);
    setSubStories(SubStoryService.get_substories_by_id(story.id));
  };

  const handleUpdateSubStory = () => {
    if (editingSubStory) {
      SubStoryService.update_substory(editingSubStory);
      setSubStories(SubStoryService.get_substories_by_id(story.id));
      setEditingSubStory(null);
    }
  };

  const handleEditSubStory = (subStory: SubStory) => {
    setEditingSubStory(subStory);
  };

  const get_username_by_id = (id: number | undefined) => {
    if (id === undefined) return 'No User Selected';
    const user = users.find(user => user.id === id);
    return user ? user.first_name : 'edytuj aby dodać';
  };

  const handleShowAllStories = () => {
    setActiveStory(null);
    StoryService.clear_active()
  }

  return (
    <div className="main-div-sub">
      <div>
        <h2>Zadanie dla {story.name}</h2>
        <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={handleShowAllStories}>Pokaż wszystkie fukcjonalności</button>
        {substories.map(subStory => (
          <div key={subStory.id} className="substory-item">
            <h3>{subStory.name}</h3>
            <p>{subStory.description}</p>
            <p>Start Date: {new Date(subStory.start).toLocaleDateString()}</p>
            <p>Owner: {get_username_by_id(subStory.owner)}</p>
            <button onClick={() => handleEditSubStory(subStory)}>Edit</button>
            <button onClick={() => handleDeleteSubStory(subStory.id)}>Delete</button>
          </div>
        ))}
      </div>
      {newSubStory && (
        <div className="edit-field">
          <h2 className='text-2xl'>Dodaj zadanie</h2>
          <input type="text" name="name" placeholder="SubStory Name" value={newSubStory.name} onChange={handleSubStoryChange} />
          <textarea name="description" placeholder="SubStory Description" value={newSubStory.description} onChange={handleSubStoryChange} />
          <select name="owner" value={newSubStory.owner} onChange={handleSubStoryChange}>
            {usersNoAdmin.map(user => (
              <option key={user.id} value={user.id}>{user.first_name}</option>
            ))}
          </select>
          <button onClick={handleAddSubStory}>Dodaj</button>
        </div>
      )}
      {editingSubStory && (
        <div className="edit-field">
          <h2>Edit SubStory</h2>
          <input type="text" name="name" value={editingSubStory.name} onChange={handleSubStoryChange} />
          <textarea name="description" value={editingSubStory.description} onChange={handleSubStoryChange} />
          <select name="owner" value={editingSubStory.owner} onChange={handleSubStoryChange}>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.first_name}</option>
            ))}
          </select>
          <button onClick={handleUpdateSubStory}>Edytuj</button>
          <button onClick={() => setEditingSubStory(null)}>Cofnij</button>
        </div>
      )}
    </div>
  );
};

export default SubStoryManager;
