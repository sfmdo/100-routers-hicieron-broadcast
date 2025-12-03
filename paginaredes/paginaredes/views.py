#from django.http import HttpResponse
from django.shortcuts import render,redirect

def redirectToDashboard(request):
    return redirect('dashboard/')
