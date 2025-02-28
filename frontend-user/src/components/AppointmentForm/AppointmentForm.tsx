import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, InputNumber, message as antMessage, Select, App } from 'antd';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Appointment } from '../../types/models';

const { TextArea } = Input;

interface AppointmentFormProps {
  buildingId: string;
  onSuccess?: () => void;
}

// Define interfaces for the component
interface FormValues {
  date: dayjs.Dayjs;
  timeSlot: string;
  contactInfo: string;
  room?: string;
  purpose: string;
  attendees: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ buildingId, onSuccess }) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{value: string, label: string}[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Generate all possible time slots
  const generateAllTimeSlots = () => {
    const slots = [];
    for (let i = 7; i < 22; i++) { // 从早上7点到晚上10点
      slots.push({
        value: `${i}-${i+1}`,
        label: `${i}:00 - ${i+1}:00`
      });
    }
    return slots;
  };

  // Fetch booked appointments and update available time slots
  const updateAvailableTimeSlots = async (date: dayjs.Dayjs) => {
    if (!date) return;
    
    try {
      setFetchingSlots(true);
      
      // Format date for API
      const formattedDate = date.format('YYYY-MM-DD');
      
      // Fetch appointments for the selected date and building
      const response = await api.getBuildingAppointments(buildingId, formattedDate);
      const appointments: Appointment[] = response.appointments || [];
      console.log(appointments);
      console.log(buildingId);
      // Get all time slots
      const allTimeSlots = generateAllTimeSlots();
      
      // Filter out booked time slots
      const bookedHours = new Set();
      
      appointments.forEach(appointment => {
        const startHour = new Date(appointment.startTime).getHours();
        const endHour = new Date(appointment.endTime).getHours();
        
        // Mark hours as booked
        for (let hour = startHour; hour < endHour; hour++) {
          bookedHours.add(hour);
        }
      });
      
      // Filter available time slots
      const available = allTimeSlots.filter(slot => {
        const [startHour] = slot.value.split('-').map(Number);
        return !bookedHours.has(startHour);
      });
      
      setAvailableTimeSlots(available);
      
      // If the currently selected time slot is no longer available, clear it
      const currentSlot = form.getFieldValue('timeSlot');
      if (currentSlot) {
        const [startHour] = currentSlot.split('-').map(Number);
        if (bookedHours.has(startHour)) {
          form.setFieldValue('timeSlot', undefined);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      antMessage.error({ content: '无法获取可用时间段，请重试', key: 'fetchError' });
      setAvailableTimeSlots(generateAllTimeSlots());
    } finally {
      setFetchingSlots(false);
    }
  };

  // When date changes, update available time slots
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    if (date) {
      updateAvailableTimeSlots(date);
    } else {
      setAvailableTimeSlots(generateAllTimeSlots());
    }
    
    // Clear the time slot when date changes
    form.setFieldValue('timeSlot', undefined);
  };

  const onFinish = async (values: FormValues) => {
    if (!user) {
      antMessage.error({ content: '请先登录', key: 'loginRequired' });
      return;
    }

    try {
      setLoading(true);
      
      // 解析日期和时间段
      const selectedDate = values.date.format('YYYY-MM-DD');
      const [startHour, endHour] = values.timeSlot.split('-');
      
      const startTime = dayjs(`${selectedDate} ${startHour}:00`);
      const endTime = dayjs(`${selectedDate} ${endHour}:00`);
      
      await api.createAppointment({
        userId: user._id,
        building: buildingId,
        contactInfo: values.contactInfo,
        room: values.room,
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
        purpose: values.purpose,
        attendees: values.attendees || 1,
      });
      
      antMessage.success({ content: '预约申请已提交，请等待确认', key: 'submitSuccess' });
      form.resetFields();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      antMessage.error({ content: '预约失败，请重试', key: 'submitError' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize with all time slots
  useEffect(() => {
    setAvailableTimeSlots(generateAllTimeSlots());
  }, []);

  return (
    <App>
      <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ attendees: 1 }}
    >
      <Form.Item
        name="date"
        label="预约日期"
        rules={[{ required: true, message: '请选择预约日期' }]}
      >
        <DatePicker 
          style={{ width: '100%' }}
          onChange={handleDateChange}
          disabledDate={(current) => {
            // 不允许选择今天之前的日期
            const isPastDate = current && current < dayjs().startOf('day');  
            // 不允许选择当前年份以外的日期
            const isOutsideCurrentYear = current && current.year() !== dayjs().year();    
            return isPastDate || isOutsideCurrentYear;
          }}
        />
      </Form.Item>

      <Form.Item
        name="timeSlot"
        label="预约时间段"
        rules={[{ required: true, message: '请选择预约时间段' }]}
      >
        <Select 
          options={availableTimeSlots} 
          placeholder="请选择预约时间段" 
          loading={fetchingSlots}
          disabled={!selectedDate || fetchingSlots}
          notFoundContent={availableTimeSlots.length === 0 ? "该日期已无可用时间段" : undefined}
        />
      </Form.Item>
      
      <Form.Item
        name="contactInfo"
        label="联系方式"
        rules={[{ required: true, message: '请输入您的联系方式' }]}
      >
        <Input placeholder="请输入您的手机号码" />
      </Form.Item>

      <Form.Item
        name="room"
        label="房间号/位置"
      >
        <Input placeholder="可选，如有特定房间请填写" />
      </Form.Item>

      <Form.Item
        name="purpose"
        label="预约目的"
        rules={[{ required: true, message: '请填写预约目的' }]}
      >
        <TextArea rows={4} placeholder="请简要描述您的预约目的" />
      </Form.Item>

      <Form.Item
        name="attendees"
        label="参与人数"
        rules={[{ required: true, message: '请填写参与人数' }]}
      >
        <InputNumber min={1} max={20} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          提交预约
        </Button>
      </Form.Item>
    </Form>
    </App>
  );
};

export default AppointmentForm;
